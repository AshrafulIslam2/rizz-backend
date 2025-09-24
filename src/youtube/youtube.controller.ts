import { Controller, Get, Query, Res, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import { YoutubeService } from './youtube.service';

@Controller('youtube/oauth')
export class YoutubeController {
    private readonly logger = new Logger(YoutubeController.name);

    constructor(private readonly youtubeService: YoutubeService) { }

    /**
     * Frontend "Connect YouTube" button calls this route
     * Standard OAuth flow - Step 1: Start OAuth flow for dedicated e-commerce channel
     */
    @Get('start')
    async startOAuth(@Res() res: Response) {
        try {
            const authUrl = this.youtubeService.getAuthUrl();
            console.log("🚀 ~ YoutubeController ~ startOAuth ~ authUrl:", authUrl)
            this.logger.log('Starting OAuth flow for e-commerce YouTube channel');

            // Redirect user to Google OAuth consent screen
            return res.redirect(authUrl);
        } catch (error) {
            this.logger.error('Failed to generate auth URL:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to generate authorization URL',
            });
        }
    }

    /**
     * Standard OAuth flow - Step 2: Handle callback from Google
     * Google sends authorization code here after user grants permission
     */
    @Get('callback')
    async handleCallback(
        @Query('code') code: string,
        @Res() res: Response
    ) {
        if (!code) {
            this.logger.error('No authorization code received from Google');
            return res.status(HttpStatus.BAD_REQUEST).json({
                error: 'Authorization code is required',
            });
        }

        try {
            // Exchange code for tokens and save to database
            const result = await this.youtubeService.handleCallback(code);

            this.logger.log('E-commerce YouTube channel authentication completed successfully');

            // Redirect to frontend success page or show success message
            return res.status(HttpStatus.OK).json({
                message: 'YouTube connected successfully! E-commerce videos can now be uploaded.',
                connected: true,
                channelName: result.channelName || null
            });
        } catch (error) {
            this.logger.error('YouTube authentication failed:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                error: 'Failed to connect YouTube account',
                details: error.message,
            });
        }
    }

    /**
     * Check if YouTube channel is connected
     * Frontend calls this to show connection status
     */
    @Get('status')
    async getConnectionStatus() {
        try {
            const isConnected = await this.youtubeService.isConnected();
            const channelInfo = isConnected ? await this.youtubeService.getChannelInfo() : null;

            return {
                connected: isConnected,
                channelName: channelInfo?.channelName || null,
                channelId: channelInfo?.channelId || null,
                message: isConnected
                    ? 'E-commerce YouTube channel is connected'
                    : 'YouTube channel not connected',
            };
        } catch (error) {
            this.logger.error('Failed to check connection status:', error);
            return {
                connected: false,
                error: 'Failed to check connection status'
            };
        }
    }
}