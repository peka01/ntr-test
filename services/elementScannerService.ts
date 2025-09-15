/**
 * Service for scanning and identifying elements that can be used as tour targets
 */

export interface ScannableElement {
  selector: string;
  tagName: string;
  id?: string;
  className?: string;
  text?: string;
  textContent?: string;
  type?: string;
  href?: string;
  title?: string;
  'data-tour'?: string;
  'data-testid'?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  visible: boolean;
  position: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
}

export class ElementScannerService {
  private static instance: ElementScannerService;
  
  public static getInstance(): ElementScannerService {
    if (!ElementScannerService.instance) {
      ElementScannerService.instance = new ElementScannerService();
    }
    return ElementScannerService.instance;
  }

  /**
   * Scan the current page for elements that can be used as tour targets
   */
  public scanForElements(): ScannableElement[] {
    const elements: ScannableElement[] = [];
    
    // Common selectors for interactive elements
    const selectors = [
      // Buttons and interactive elements
      'button',
      'a[href]',
      'input[type="button"]',
      'input[type="submit"]',
      'input[type="reset"]',
      'input[type="checkbox"]',
      'input[type="radio"]',
      'select',
      'textarea',
      
      // Navigation elements
      'nav',
      'nav a',
      'nav button',
      '[role="navigation"]',
      '[role="menuitem"]',
      '[role="tab"]',
      '[role="button"]',
      
      // Form elements
      'form',
      'fieldset',
      'legend',
      'label',
      'input:not([type="hidden"])',
      
      // Content areas
      'main',
      'section',
      'article',
      'header',
      'footer',
      'aside',
      
      // Custom tour elements
      '[data-tour]',
      '[data-testid]',
      '[data-cy]',
      
      // Common UI components
      '.btn',
      '.button',
      '.nav-item',
      '.menu-item',
      '.tab',
      '.card',
      '.modal',
      '.dropdown',
      '.tooltip',
      '.help-button',
      '.help-icon',
      
      // Specific to this app
      '#help-button',
      '#user-menu',
      '#main-navigation',
      '#sidebar',
      '#content-area',
      '.page-header',
      '.page-content',
      '.page-footer'
    ];

    selectors.forEach(selector => {
      try {
        const foundElements = document.querySelectorAll(selector);
        foundElements.forEach(element => {
          if (this.isElementSuitable(element as HTMLElement)) {
            const scannableElement = this.createElementInfo(element as HTMLElement, selector);
            if (scannableElement) {
              elements.push(scannableElement);
            }
          }
        });
      } catch (error) {
        console.warn('Error scanning selector:', selector, error);
      }
    });

    // Remove duplicates and sort by relevance
    return this.deduplicateAndSort(elements);
  }

  /**
   * Check if an element is suitable for tour targeting
   */
  private isElementSuitable(element: HTMLElement): boolean {
    // Skip hidden elements
    if (element.offsetWidth === 0 && element.offsetHeight === 0) {
      return false;
    }

    // Skip elements that are not visible
    const style = window.getComputedStyle(element);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }

    // Skip elements that are too small (less than 10x10 pixels)
    if (element.offsetWidth < 10 || element.offsetHeight < 10) {
      return false;
    }

    // Skip elements that are positioned off-screen
    const rect = element.getBoundingClientRect();
    if (rect.top < -1000 || rect.left < -1000) {
      return false;
    }

    return true;
  }

  /**
   * Create element information object
   */
  private createElementInfo(element: HTMLElement, selector: string): ScannableElement | null {
    try {
      const rect = element.getBoundingClientRect();
      
      const displayText = this.getDisplayText(element);
      return {
        selector: this.generateSelector(element),
        tagName: element.tagName.toLowerCase(),
        id: element.id || undefined,
        className: element.className || undefined,
        text: displayText,
        textContent: displayText,
        type: (element as any).type || undefined,
        href: (element as any).href || undefined,
        title: element.title || undefined,
        'data-tour': element.getAttribute('data-tour') || undefined,
        'data-testid': element.getAttribute('data-testid') || undefined,
        'aria-label': element.getAttribute('aria-label') || undefined,
        'aria-labelledby': element.getAttribute('aria-labelledby') || undefined,
        visible: this.isElementVisible(element),
        position: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        }
      };
    } catch (error) {
      console.warn('Error creating element info:', error);
      return null;
    }
  }

  /**
   * Generate a unique selector for an element
   */
  private generateSelector(element: HTMLElement): string {
    // Prefer ID if available
    if (element.id) {
      return `#${element.id}`;
    }

    // Use data-tour attribute if available
    const dataTour = element.getAttribute('data-tour');
    if (dataTour) {
      return `[data-tour="${dataTour}"]`;
    }

    // Use data-testid if available
    const dataTestId = element.getAttribute('data-testid');
    if (dataTestId) {
      return `[data-testid="${dataTestId}"]`;
    }

    // Generate selector based on tag and classes
    let selector = element.tagName.toLowerCase();
    
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) {
        // Use the first meaningful class
        const meaningfulClass = classes.find(c => 
          !c.includes('hover:') && 
          !c.includes('focus:') && 
          !c.includes('active:') &&
          c.length > 2
        );
        if (meaningfulClass) {
          selector += `.${meaningfulClass}`;
        }
      }
    }

    // Add nth-child if needed for uniqueness
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(child => 
        child.tagName === element.tagName
      );
      if (siblings.length > 1) {
        const index = siblings.indexOf(element) + 1;
        selector += `:nth-child(${index})`;
      }
    }

    return selector;
  }

  /**
   * Get display text for an element
   */
  private getDisplayText(element: HTMLElement): string {
    // For buttons and links, use their text content
    if (['button', 'a'].includes(element.tagName.toLowerCase())) {
      return element.textContent?.trim().substring(0, 50) || '';
    }

    // For inputs, use placeholder or type
    if (element.tagName.toLowerCase() === 'input') {
      const input = element as HTMLInputElement;
      return input.placeholder || input.type || '';
    }

    // For other elements, use title or aria-label
    return element.title || 
           element.getAttribute('aria-label') || 
           element.textContent?.trim().substring(0, 30) || '';
  }

  /**
   * Check if element is visible in viewport
   */
  private isElementVisible(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }

  /**
   * Remove duplicates and sort elements by relevance
   */
  private deduplicateAndSort(elements: ScannableElement[]): ScannableElement[] {
    // Remove duplicates based on selector
    const unique = elements.filter((element, index, self) => 
      index === self.findIndex(e => e.selector === element.selector)
    );

    // Sort by relevance
    return unique.sort((a, b) => {
      // Prioritize elements with IDs
      if (a.id && !b.id) return -1;
      if (!a.id && b.id) return 1;

      // Prioritize elements with data-tour attributes
      if (a['data-tour'] && !b['data-tour']) return -1;
      if (!a['data-tour'] && b['data-tour']) return 1;

      // Prioritize interactive elements
      const interactiveTags = ['button', 'a', 'input', 'select', 'textarea'];
      const aInteractive = interactiveTags.includes(a.tagName);
      const bInteractive = interactiveTags.includes(b.tagName);
      if (aInteractive && !bInteractive) return -1;
      if (!aInteractive && bInteractive) return 1;

      // Sort by position (top to bottom, left to right)
      if (Math.abs(a.position.top - b.position.top) > 10) {
        return a.position.top - b.position.top;
      }
      return a.position.left - b.position.left;
    });
  }

  /**
   * Highlight an element temporarily
   */
  public highlightElement(selector: string): void {
    try {
      // Remove any existing highlights first
      this.removeAllHighlights();
      
      const element = document.querySelector(selector);
      if (element) {
        // Add highlight class
        element.classList.add('tour-highlight');
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } catch (error) {
      console.warn('Error highlighting element:', error);
    }
  }

  /**
   * Remove all element highlights
   */
  public removeAllHighlights(): void {
    try {
      const highlightedElements = document.querySelectorAll('.tour-highlight');
      highlightedElements.forEach(element => {
        element.classList.remove('tour-highlight');
      });
    } catch (error) {
      console.warn('Error removing highlights:', error);
    }
  }

  /**
   * Get element information by selector
   */
  public getElementInfo(selector: string): ScannableElement | null {
    try {
      const element = document.querySelector(selector);
      if (element && this.isElementSuitable(element as HTMLElement)) {
        return this.createElementInfo(element as HTMLElement, selector);
      }
    } catch (error) {
      console.warn('Error getting element info:', error);
    }
    return null;
  }
}

export const elementScannerService = ElementScannerService.getInstance();
