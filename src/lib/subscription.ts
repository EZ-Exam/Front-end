import { UserData } from '@/pages/auth/AuthContext';

// Định nghĩa các subscription levels
export enum SubscriptionLevel {
  FREE = 'FREE',
  BASIC = 'BASIC', 
  PREMIUM = 'PREMIUM',
  PRO = 'PRO',
  UNLIMITED = 'UNLIMITED'
}

// Định nghĩa các role IDs
export enum RoleId {
  USER = '1',
  ADMIN = '2', 
  MODERATOR = '3'
}

// Utility functions để kiểm tra subscription và permissions
export class SubscriptionUtils {
  
  /**
   * Lấy subscription level từ user data
   */
  static getSubscriptionLevel(user: UserData | null): SubscriptionLevel {
    if (!user?.subscriptionName) {
      return SubscriptionLevel.FREE;
    }
    
    const subscriptionName = user.subscriptionName.toUpperCase();
    switch (subscriptionName) {
      case 'BASIC':
        return SubscriptionLevel.BASIC;
      case 'PREMIUM':
        return SubscriptionLevel.PREMIUM;
      case 'PRO':
        return SubscriptionLevel.PRO;
      case 'UNLIMITED':
        return SubscriptionLevel.UNLIMITED;
      default:
        return SubscriptionLevel.FREE;
    }
  }

  /**
   * Kiểm tra xem user có phải là FREE subscription không
   */
  static isFreeUser(user: UserData | null): boolean {
    return this.getSubscriptionLevel(user) === SubscriptionLevel.FREE;
  }

  /**
   * Kiểm tra xem user có subscription BASIC trở lên không
   */
  static hasBasicOrHigher(user: UserData | null): boolean {
    const level = this.getSubscriptionLevel(user);
    return level !== SubscriptionLevel.FREE;
  }

  /**
   * Kiểm tra xem user có subscription PREMIUM trở lên không
   */
  static hasPremiumOrHigher(user: UserData | null): boolean {
    const level = this.getSubscriptionLevel(user);
    return level === SubscriptionLevel.PREMIUM || 
           level === SubscriptionLevel.PRO || 
           level === SubscriptionLevel.UNLIMITED;
  }

  /**
   * Kiểm tra xem user có phải là Moderator không
   */
  static isModerator(user: UserData | null): boolean {
    return user?.roleId === RoleId.MODERATOR;
  }

  /**
   * Kiểm tra xem user có phải là Admin không
   */
  static isAdmin(user: UserData | null): boolean {
    return user?.roleId === RoleId.ADMIN;
  }

  /**
   * Kiểm tra xem user có quyền tạo Question và Lesson không
   * Chỉ Moderator mới được tạo
   */
  static canCreateQuestionAndLesson(user: UserData | null): boolean {
    return this.isModerator(user) || this.isAdmin(user);
  }

  /**
   * Kiểm tra xem user có quyền tạo Mock Test không
   * User cần có subscription PREMIUM trở lên
   */
  static canCreateMockTest(user: UserData | null): boolean {
    return this.hasPremiumOrHigher(user);
  }

  /**
   * Kiểm tra xem user có quyền xem đáp án và giải thích không
   * User cần có subscription BASIC trở lên
   */
  static canViewAnswersAndExplanations(user: UserData | null): boolean {
    return this.hasBasicOrHigher(user);
  }

  /**
   * Kiểm tra xem user có quyền xem Analytics và Details không
   * User cần có subscription BASIC trở lên
   */
  static canViewAnalyticsAndDetails(user: UserData | null): boolean {
    return this.hasBasicOrHigher(user);
  }

  /**
   * Kiểm tra xem user có quyền comment trong Question Bank không
   * User cần có subscription BASIC trở lên
   */
  static canCommentInQuestionBank(user: UserData | null): boolean {
    return this.hasBasicOrHigher(user);
  }

  /**
   * Lấy thông báo cần upgrade subscription
   */
  static getUpgradeMessage(requiredLevel: SubscriptionLevel): string {
    switch (requiredLevel) {
      case SubscriptionLevel.BASIC:
        return 'Bạn cần nâng cấp lên gói BASIC để sử dụng tính năng này.';
      case SubscriptionLevel.PREMIUM:
        return 'Bạn cần nâng cấp lên gói PREMIUM để sử dụng tính năng này.';
      case SubscriptionLevel.PRO:
        return 'Bạn cần nâng cấp lên gói PRO để sử dụng tính năng này.';
      default:
        return 'Bạn cần nâng cấp subscription để sử dụng tính năng này.';
    }
  }

  /**
   * Lấy subscription level hiển thị cho user
   */
  static getDisplaySubscriptionLevel(user: UserData | null): string {
    if (!user?.subscriptionName) {
      return 'FREE';
    }
    return user.subscriptionName.toUpperCase();
  }
}
