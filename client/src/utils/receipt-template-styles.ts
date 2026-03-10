/**
 * Utility functions untuk styling receipt template berdasarkan tipe
 * Redesigned dengan improvements: better typography, spacing, visual hierarchy
 */

export interface TemplateStyles {
  containerClass: string;
  headerClass: string;
  titleClass: string;
  contentClass: string;
  itemClass: string;
  totalClass: string;
  footerClass: string;
  fontFamily: string;
  fontSize: string;
}

export function getTemplateStyles(templateType: string, styles?: any): TemplateStyles {
  const baseStyles = {
    CLASSIC: {
      containerClass: 'border-2 border-gray-900 shadow-sm',
      headerClass: 'border-b-2 border-gray-900 bg-gradient-to-b from-gray-50 to-white',
      titleClass: 'text-gray-900',
      contentClass: 'border-gray-400',
      itemClass: 'border-b border-dashed border-gray-400',
      totalClass: 'border-t-2 border-gray-900 bg-gray-100',
      footerClass: 'border-t border-gray-900 bg-gray-50',
      fontFamily: 'Arial, "Helvetica Neue", sans-serif',
      fontSize: styles?.fontSize || '12px',
    },
    MODERN: {
      containerClass: 'border-0 shadow-lg',
      headerClass: 'border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white',
      titleClass: 'text-gray-900',
      contentClass: 'border-gray-100',
      itemClass: 'border-b border-dotted border-gray-200',
      totalClass: 'border-t-2 border-gray-900 bg-gradient-to-r from-gray-50 to-white',
      footerClass: 'border-t border-gray-200',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      fontSize: styles?.fontSize || '11px',
    },
    MINIMAL: {
      containerClass: 'border-0',
      headerClass: 'border-b border-gray-300',
      titleClass: 'text-gray-900',
      contentClass: 'border-gray-200',
      itemClass: 'border-b border-gray-200',
      totalClass: 'border-t border-gray-900',
      footerClass: 'border-t border-gray-300',
      fontFamily: '"Courier New", "Courier", monospace',
      fontSize: styles?.fontSize || '9px',
    },
    PROFESSIONAL: {
      containerClass: 'border border-gray-400 shadow-md',
      headerClass: 'border-b border-gray-400 bg-gradient-to-b from-gray-50 to-white',
      titleClass: 'text-gray-900',
      contentClass: 'border-gray-300',
      itemClass: 'border-b border-solid border-gray-300',
      totalClass: 'border-t-2 border-gray-900 bg-gray-100',
      footerClass: 'border-t border-gray-400 bg-gray-50',
      fontFamily: 'Arial, "Helvetica Neue", sans-serif',
      fontSize: styles?.fontSize || '11px',
    },
    // Legacy support
    DEFAULT: {
      containerClass: 'border-2 border-gray-400 shadow-sm',
      headerClass: 'border-b-2 border-gray-400 bg-gray-50',
      titleClass: 'text-gray-900',
      contentClass: 'border-gray-300',
      itemClass: 'border-b border-dashed border-gray-300',
      totalClass: 'border-t-2 border-gray-900 bg-gray-100',
      footerClass: 'border-t border-gray-400 bg-gray-50',
      fontFamily: 'Arial, "Helvetica Neue", sans-serif',
      fontSize: styles?.fontSize || '12px',
    },
  };

  return baseStyles[templateType as keyof typeof baseStyles] || baseStyles.CLASSIC;
}

export function getTemplateHeaderStyle(templateType: string, _styles?: any): string {
  const styleMap: Record<string, string> = {
    CLASSIC: 'text-center mb-4 sm:mb-6 border-b-2 border-gray-900 pb-4 sm:pb-6 bg-gradient-to-b from-gray-50 to-white',
    MODERN: 'text-center mb-4 sm:mb-6 border-b border-gray-200 pb-4 sm:pb-6 bg-gradient-to-r from-gray-50 to-white',
    MINIMAL: 'text-center mb-2 sm:mb-3 border-b border-gray-300 pb-2 sm:pb-3',
    PROFESSIONAL: 'text-center mb-4 sm:mb-6 border-b-2 border-gray-400 pb-4 sm:pb-6 bg-gradient-to-b from-gray-50 to-white',
    // Legacy support
    DEFAULT: 'text-center mb-4 sm:mb-6 border-b-2 border-gray-400 pb-4 sm:pb-6 bg-gray-50',
  };
  return styleMap[templateType] || styleMap.CLASSIC;
}

export function getTemplateTitleStyle(templateType: string): string {
  const styleMap: Record<string, string> = {
    CLASSIC: 'text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 tracking-tight',
    MODERN: 'text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 tracking-tight',
    MINIMAL: 'text-base sm:text-lg font-bold mb-1 sm:mb-2 text-gray-900 tracking-tight',
    PROFESSIONAL: 'text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 tracking-tight',
    // Legacy support
    DEFAULT: 'text-lg sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 text-gray-900 tracking-tight',
  };
  return styleMap[templateType] || styleMap.CLASSIC;
}

export function getTemplateContentStyle(templateType: string): string {
  const styleMap: Record<string, string> = {
    CLASSIC: 'space-y-2 border-gray-400',
    MODERN: 'space-y-2 border-gray-100',
    MINIMAL: 'space-y-1 border-gray-200',
    PROFESSIONAL: 'space-y-2 border-gray-300',
    // Legacy support
    DEFAULT: 'space-y-2 border-gray-300',
  };
  return styleMap[templateType] || styleMap.CLASSIC;
}

export function getTemplateItemStyle(templateType: string): string {
  const styleMap: Record<string, string> = {
    CLASSIC: 'border-b border-dashed border-gray-400 pb-2',
    MODERN: 'border-b border-dotted border-gray-200 pb-2',
    MINIMAL: 'border-b border-gray-200 pb-1',
    PROFESSIONAL: 'border-b border-solid border-gray-300 pb-2',
    // Legacy support
    DEFAULT: 'border-b border-dashed border-gray-300 pb-2',
  };
  return styleMap[templateType] || styleMap.CLASSIC;
}

export function getTemplateTotalStyle(templateType: string): string {
  const styleMap: Record<string, string> = {
    CLASSIC: 'flex justify-between items-center text-base sm:text-lg md:text-xl font-bold border-t-2 border-gray-900 pt-3 sm:pt-4 mt-3 sm:mt-4 bg-gray-100 px-3 sm:px-4 py-2 sm:py-3 rounded-sm',
    MODERN: 'flex justify-between items-center text-base sm:text-lg md:text-xl font-bold border-t-2 border-gray-900 pt-3 sm:pt-4 mt-3 sm:mt-4 bg-gradient-to-r from-gray-50 to-white px-3 sm:px-4 py-2 sm:py-3',
    MINIMAL: 'flex justify-between items-center text-sm sm:text-base font-bold border-t border-gray-900 pt-2 sm:pt-3 mt-2 sm:mt-3',
    PROFESSIONAL: 'flex justify-between items-center text-base sm:text-lg md:text-xl font-bold border-t-2 border-gray-900 pt-3 sm:pt-4 mt-3 sm:mt-4 bg-gray-100 px-3 sm:px-4 py-2 sm:py-3 rounded-sm',
    // Legacy support
    DEFAULT: 'flex justify-between items-center text-base sm:text-lg md:text-xl font-bold border-t-2 border-gray-900 pt-3 sm:pt-4 mt-3 sm:mt-4 bg-gray-100 px-3 sm:px-4 py-2 sm:py-3 rounded-sm',
  };
  return styleMap[templateType] || styleMap.CLASSIC;
}

export function getTemplateFooterStyle(templateType: string): string {
  const styleMap: Record<string, string> = {
    CLASSIC: 'text-center mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-900 bg-gray-50 px-2 sm:px-4',
    MODERN: 'text-center mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 px-2 sm:px-4',
    MINIMAL: 'text-center mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-300 px-2',
    PROFESSIONAL: 'text-center mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-400 bg-gray-50 px-2 sm:px-4',
    // Legacy support
    DEFAULT: 'text-center mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-400 bg-gray-50 px-2 sm:px-4',
  };
  return styleMap[templateType] || styleMap.CLASSIC;
}

