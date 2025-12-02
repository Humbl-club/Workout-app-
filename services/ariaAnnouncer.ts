/**
 * ARIA Live Region Announcer Service
 *
 * Provides screen reader announcements for dynamic content
 * Uses ARIA live regions for accessibility
 */

type AnnouncementPriority = 'polite' | 'assertive';

class AriaAnnouncer {
  private politeRegion: HTMLDivElement | null = null;
  private assertiveRegion: HTMLDivElement | null = null;
  private initialized = false;

  /**
   * Initialize ARIA live regions
   * Should be called once on app mount
   */
  init() {
    if (this.initialized || typeof document === 'undefined') return;

    // Create polite live region
    this.politeRegion = document.createElement('div');
    this.politeRegion.setAttribute('aria-live', 'polite');
    this.politeRegion.setAttribute('aria-atomic', 'true');
    this.politeRegion.setAttribute('class', 'sr-only');
    document.body.appendChild(this.politeRegion);

    // Create assertive live region
    this.assertiveRegion = document.createElement('div');
    this.assertiveRegion.setAttribute('aria-live', 'assertive');
    this.assertiveRegion.setAttribute('aria-atomic', 'true');
    this.assertiveRegion.setAttribute('class', 'sr-only');
    document.body.appendChild(this.assertiveRegion);

    this.initialized = true;
  }

  /**
   * Announce a message to screen readers
   * @param message - The message to announce
   * @param priority - 'polite' (default) or 'assertive'
   */
  announce(message: string, priority: AnnouncementPriority = 'polite') {
    if (!this.initialized) {
      this.init();
    }

    const region = priority === 'assertive' ? this.assertiveRegion : this.politeRegion;

    if (region) {
      // Clear previous message
      region.textContent = '';

      // Announce new message after small delay (helps screen readers)
      setTimeout(() => {
        region.textContent = message;
      }, 100);
    }
  }

  /**
   * Announce workout progress
   */
  announceWorkoutProgress(exerciseNumber: number, totalExercises: number, exerciseName: string) {
    this.announce(
      `Exercise ${exerciseNumber} of ${totalExercises}: ${exerciseName}`,
      'polite'
    );
  }

  /**
   * Announce set completion
   */
  announceSetComplete(setNumber: number, weight?: number, reps?: number) {
    let message = `Set ${setNumber} logged`;
    if (weight && reps) {
      message += `: ${weight} kilograms for ${reps} reps`;
    }
    this.announce(message, 'polite');
  }

  /**
   * Announce PR achievement
   */
  announcePR(exerciseName: string, weight: number, reps: number) {
    this.announce(
      `Personal record! ${exerciseName}: ${weight} kilograms for ${reps} reps`,
      'assertive'
    );
  }

  /**
   * Announce workout completion
   */
  announceWorkoutComplete(duration: number, exerciseCount: number) {
    this.announce(
      `Workout complete! ${exerciseCount} exercises in ${duration} minutes`,
      'assertive'
    );
  }

  /**
   * Announce rest timer
   */
  announceRestTimer(seconds: number) {
    if (seconds === 30 || seconds === 10 || seconds <= 3) {
      this.announce(`${seconds} seconds remaining`, 'polite');
    }
  }

  /**
   * Announce page navigation
   */
  announcePage(pageName: string) {
    this.announce(`Navigated to ${pageName} page`, 'polite');
  }

  /**
   * Announce loading state
   */
  announceLoading(isLoading: boolean, context?: string) {
    const message = isLoading
      ? `Loading${context ? ` ${context}` : ''}...`
      : `${context || 'Content'} loaded`;
    this.announce(message, 'polite');
  }

  /**
   * Announce error
   */
  announceError(error: string) {
    this.announce(`Error: ${error}`, 'assertive');
  }

  /**
   * Cleanup live regions
   */
  destroy() {
    if (this.politeRegion) {
      document.body.removeChild(this.politeRegion);
      this.politeRegion = null;
    }
    if (this.assertiveRegion) {
      document.body.removeChild(this.assertiveRegion);
      this.assertiveRegion = null;
    }
    this.initialized = false;
  }
}

// Export singleton instance
export const ariaAnnouncer = new AriaAnnouncer();
