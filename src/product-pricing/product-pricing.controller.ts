import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    ParseIntPipe,
    HttpCode,
    HttpStatus,
    Query,
} from '@nestjs/common';
import { ProductPricingService } from './product-pricing.service';
import {
    CreatePricingRuleDto,
    UpdatePricingRuleDto,
    GetPriceDto,
    BulkCreatePricingRulesDto,
    PricingRuleType,
} from './dto/product-pricing.dto';

@Controller('product-pricing')
export class ProductPricingController {
    constructor(private readonly productPricingService: ProductPricingService) { }

    @Post('rules')
    @HttpCode(HttpStatus.CREATED)
    createPricingRule(@Body() createPricingRuleDto: CreatePricingRuleDto) {
        return this.productPricingService.createPricingRule(createPricingRuleDto);
    }

    @Post('product/:productId/rules/bulk')
    @HttpCode(HttpStatus.CREATED)
    bulkCreatePricingRules(
        @Param('productId', ParseIntPipe) productId: number,
        @Body() bulkCreateDto: BulkCreatePricingRulesDto
    ) {
        return this.productPricingService.bulkCreatePricingRules(productId, bulkCreateDto);
    }

    @Post('calculate')
    @HttpCode(HttpStatus.OK)
    calculatePrice(@Body() getPriceDto: GetPriceDto) {
        return this.productPricingService.calculatePrice(getPriceDto);
    }

    @Get('product/:productId/rules')
    getProductPricingRules(@Param('productId', ParseIntPipe) productId: number) {
        return this.productPricingService.getProductPricingRules(productId);
    }

    @Get('product/:productId/rules/type/:ruleType')
    getPricingRulesByType(
        @Param('productId', ParseIntPipe) productId: number,
        @Param('ruleType') ruleType: PricingRuleType,
    ) {
        return this.productPricingService.getPricingRulesByType(productId, ruleType);
    }

    @Patch('rules/:id')
    updatePricingRule(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePricingRuleDto: UpdatePricingRuleDto,
    ) {
        return this.productPricingService.updatePricingRule(id, updatePricingRuleDto);
    }

    @Delete('rules/:id')
    @HttpCode(HttpStatus.OK)
    deletePricingRule(@Param('id', ParseIntPipe) id: number) {
        return this.productPricingService.deletePricingRule(id);
    }
}