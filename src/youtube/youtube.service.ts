import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, youtube_v3 } from 'googleapis';
import { OAuth2Client, Credentials } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';

@Injectable()
export class YoutubeService {
    private readonly logger = new Logger(YoutubeService.name);
    private oauth2Client: OAuth2Client;
    private youtube: youtube_v3.Youtube;
    private readonly YOUTUBE_AUTH_ID = 'default'; // Fixed ID for single channel (matches schema default)

    constructor(
        private configService: ConfigService,
        private prisma: PrismaService,
    ) {
        this.initializeOAuth2Client();
    }

    private initializeOAuth2Client() {
        const clientId = this.configService.get('GOOGLE_CLIENT_ID');
        const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
        const redirectUri = this.configService.get('YOUTUBE_REDIRECT_URI');

        this.logger.log(`Initializing OAuth2 Client with:`);
        this.logger.log(`Client ID: ${clientId ? `${clientId.substring(0, 20)}...` : 'MISSING'}`);
        this.logger.log(`Client Secret: ${clientSecret ? `${clientSecret.substring(0, 10)}...` : 'MISSING'}`);
        this.logger.log(`Redirect URI: ${redirectUri || 'MISSING'}`);

        if (!clientId || !clientSecret || !redirectUri) {
            throw new Error('YouTube OAuth is not properly configured. Missing required environment variables.');
        }

        this.oauth2Client = new google.auth.OAuth2(
            clientId,
            clientSecret,
            redirectUri,
        );

        this.youtube = google.youtube({
            version: 'v3',
            auth: this.oauth2Client,
        });
    }

    /**
     * Standard OAuth Step 1: Generate authorization URL for dedicated e-commerce channel
     */
    getAuthUrl(): string {
        const scopes = [
            'https://www.googleapis.com/auth/youtube.upload',
            'https://www.googleapis.com/auth/youtube.readonly',
        ];

        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent', // Force consent to get refresh token
        });
    }

    /**
     * Standard OAuth Step 2: Handle callback and store tokens for e-commerce channel
     */
    async handleCallback(code: string): Promise<{ channelName?: string }> {
        try {
            // Exchange authorization code for tokens
            const { tokens } = await this.oauth2Client.getToken(code);

            // Set tokens for this OAuth client instance
            this.oauth2Client.setCredentials(tokens);

            // Get YouTube channel information
            let channelInfo: { channelId?: string; channelName?: string } | null = null;
            try {
                const channelResponse = await this.youtube.channels.list({
                    part: ['snippet'],
                    mine: true,
                });

                if (channelResponse.data.items && channelResponse.data.items.length > 0) {
                    const channel = channelResponse.data.items[0];
                    channelInfo = {
                        channelId: channel.id || undefined,
                        channelName: channel.snippet?.title || undefined,
                    };
                }
            } catch (channelError) {
                this.logger.warn('Could not fetch channel info:', channelError);
            }

            // Store tokens in database for single e-commerce channel
            await this.prisma.youTubeAuth.upsert({
                where: { id: this.YOUTUBE_AUTH_ID },
                update: {
                    accessToken: tokens.access_token!,
                    refreshToken: tokens.refresh_token || undefined,
                    expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                    scope: tokens.scope,
                    channelId: channelInfo?.channelId,
                    channelName: channelInfo?.channelName,
                    updatedAt: new Date(),
                },
                create: {
                    id: this.YOUTUBE_AUTH_ID,
                    accessToken: tokens.access_token!,
                    refreshToken: tokens.refresh_token,
                    expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
                    scope: tokens.scope,
                    channelId: channelInfo?.channelId,
                    channelName: channelInfo?.channelName,
                },
            });

            this.logger.log('YouTube tokens saved for e-commerce channel');
            return { channelName: channelInfo?.channelName };

        } catch (error) {
            this.logger.error('Error in handleCallback:', error);
            throw new Error(`Failed to authenticate with YouTube: ${error.message}`);
        }
    }

    /**
     * Check if e-commerce YouTube channel is connected
     */
    async isConnected(): Promise<boolean> {
        try {
            const auth = await this.prisma.youTubeAuth.findUnique({
                where: { id: this.YOUTUBE_AUTH_ID },
            });

            if (!auth) return false;

            // Check if token is not expired
            if (auth.expiryDate && auth.expiryDate < new Date()) {
                // Try to refresh token
                if (auth.refreshToken) {
                    try {
                        await this.refreshToken();
                        return true;
                    } catch (error) {
                        this.logger.warn('Failed to refresh token for e-commerce channel:', error);
                        return false;
                    }
                }
                return false;
            }

            return true;
        } catch (error) {
            this.logger.error('Error checking e-commerce channel connection:', error);
            return false;
        }
    }

    /**
     * Get channel information for e-commerce channel
     */
    async getChannelInfo(): Promise<{ channelId?: string; channelName?: string } | null> {
        try {
            const auth = await this.prisma.youTubeAuth.findUnique({
                where: { id: this.YOUTUBE_AUTH_ID },
            });

            if (!auth) return null;

            return {
                channelId: auth.channelId || undefined,
                channelName: auth.channelName || undefined,
            };
        } catch (error) {
            this.logger.error('Error getting e-commerce channel info:', error);
            return null;
        }
    }

    /**
     * Refresh access token for e-commerce channel
     */
    private async refreshToken(): Promise<void> {
        const auth = await this.prisma.youTubeAuth.findUnique({
            where: { id: this.YOUTUBE_AUTH_ID },
        });

        if (!auth || !auth.refreshToken) {
            throw new Error('No refresh token available for e-commerce channel');
        }

        this.oauth2Client.setCredentials({
            refresh_token: auth.refreshToken,
        });

        const { credentials } = await this.oauth2Client.refreshAccessToken();

        await this.prisma.youTubeAuth.update({
            where: { id: this.YOUTUBE_AUTH_ID },
            data: {
                accessToken: credentials.access_token!,
                expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
                updatedAt: new Date(),
            },
        });
    }

    /**
     * Set up OAuth client for e-commerce channel before API calls
     */
    private async setupAuth(): Promise<void> {
        const auth = await this.prisma.youTubeAuth.findUnique({
            where: { id: this.YOUTUBE_AUTH_ID },
        });

        if (!auth) {
            throw new Error('E-commerce YouTube channel is not connected');
        }

        // Check if token needs refresh
        if (auth.expiryDate && auth.expiryDate < new Date() && auth.refreshToken) {
            await this.refreshToken();
            // Re-fetch updated auth
            const updatedAuth = await this.prisma.youTubeAuth.findUnique({
                where: { id: this.YOUTUBE_AUTH_ID },
            });
            if (updatedAuth) {
                this.oauth2Client.setCredentials({
                    access_token: updatedAuth.accessToken,
                    refresh_token: updatedAuth.refreshToken,
                });
            }
        } else {
            this.oauth2Client.setCredentials({
                access_token: auth.accessToken,
                refresh_token: auth.refreshToken,
            });
        }
    }

    /**
     * Upload video to e-commerce YouTube channel
     */
    async uploadVideo(
        filePath: string,
        title: string,
        description: string,
        tags: string[] = [],
    ): Promise<string> {
        // Set up authentication for e-commerce channel
        await this.setupAuth();

        if (!fs.existsSync(filePath)) {
            throw new Error('Video file not found');
        }

        try {
            this.logger.log(`Starting YouTube upload to e-commerce channel: ${title}`);

            const fileSize = fs.statSync(filePath).size;
            this.logger.log(`File size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);

            const media = {
                mimeType: 'video/*',
                body: fs.createReadStream(filePath),
            };

            const requestBody: youtube_v3.Schema$Video = {
                snippet: {
                    title,
                    description,
                    tags,
                    categoryId: '22', // People & Blogs category
                    defaultLanguage: 'en',
                    defaultAudioLanguage: 'en',
                },
                status: {
                    privacyStatus: 'public', // or 'unlisted', 'private'
                    selfDeclaredMadeForKids: false,
                },
            };

            const response = await this.youtube.videos.insert({
                part: ['snippet', 'status'],
                requestBody,
                media,
            });

            const videoId = response.data.id;
            if (!videoId) {
                throw new Error('No video ID returned from YouTube');
            }

            this.logger.log(`Video uploaded successfully to e-commerce channel. YouTube ID: ${videoId}`);
            return videoId;
        } catch (error) {
            this.logger.error('YouTube upload failed:', error);

            // Handle specific YouTube API errors
            if (error.code === 401) {
                throw new Error('YouTube authentication expired. Please re-authenticate.');
            } else if (error.code === 403) {
                throw new Error('YouTube quota exceeded or permission denied.');
            } else if (error.code === 400) {
                throw new Error('Invalid video file or parameters.');
            }

            throw new Error(`YouTube upload failed: ${error.message}`);
        }
    }

    /**
     * Get video details from YouTube
     */
    async getVideoDetails(videoId: string) {
        try {
            await this.setupAuth();

            const response = await this.youtube.videos.list({
                part: ['snippet', 'status', 'statistics'],
                id: [videoId],
            });

            return response.data.items?.[0] || null;
        } catch (error) {
            this.logger.error(`Failed to get video details for ${videoId}:`, error);
            throw error;
        }
    }

    /**
     * Check if video is fully processed by YouTube
     */
    async isVideoProcessed(videoId: string): Promise<boolean> {
        try {
            const video = await this.getVideoDetails(videoId);
            return video?.status?.uploadStatus === 'processed';
        } catch (error) {
            this.logger.error(`Failed to check video status for ${videoId}:`, error);
            return false;
        }
    }

    /**
     * Delete video from YouTube
     */
    async deleteVideo(videoId: string): Promise<void> {
        try {
            await this.setupAuth();

            await this.youtube.videos.delete({
                id: videoId,
            });
            this.logger.log(`Video ${videoId} deleted from e-commerce YouTube channel`);
        } catch (error) {
            this.logger.error(`Failed to delete video ${videoId}:`, error);
            throw error;
        }
    }

    /**
     * Disconnect the e-commerce YouTube channel.
     * This attempts to revoke any tokens with Google and clears stored credentials in the database.
     */
    async disconnect(): Promise<void> {
        try {
            const auth = await this.prisma.youTubeAuth.findUnique({
                where: { id: this.YOUTUBE_AUTH_ID },
            });

            if (!auth) {
                this.logger.log('No e-commerce YouTube auth record found to disconnect');
                return;
            }

            // Attempt to revoke access/refresh tokens with Google (best-effort)
            try {
                if (auth.accessToken) {
                    await this.oauth2Client.revokeToken(auth.accessToken).catch(err => {
                        this.logger.warn('Failed to revoke access token:', err);
                    });
                }

                if (auth.refreshToken) {
                    await this.oauth2Client.revokeToken(auth.refreshToken).catch(err => {
                        this.logger.warn('Failed to revoke refresh token:', err);
                    });
                }
            } catch (revokeErr) {
                this.logger.warn('Error while revoking tokens (continuing to clear DB):', revokeErr);
            }

            // Remove the stored credentials record entirely so isConnected() will return false
            await this.prisma.youTubeAuth.delete({
                where: { id: this.YOUTUBE_AUTH_ID },
            }).catch(err => {
                // If delete fails (e.g., already deleted), log and continue
                this.logger.warn('Could not delete YouTubeAuth record (may already be removed):', err.message || err);
            });

            this.logger.log('E-commerce YouTube channel disconnected and credentials cleared');
        } catch (error) {
            this.logger.error('Failed to disconnect e-commerce YouTube channel:', error);
            throw error;
        }
    }
}