import type { IconType } from 'react-icons';
import {
  PiArrowLeftBold,
  PiArrowRightBold,
  PiArrowsLeftRightDuotone,
  PiBankDuotone,
  PiBasketDuotone,
  PiBellRingingDuotone,
  PiBowlFoodDuotone,
  PiCaretLeftBold,
  PiCaretRightBold,
  PiCheckBold,
  PiCheckCircleDuotone,
  PiClipboardTextDuotone,
  PiClockCounterClockwiseDuotone,
  PiClockDuotone,
  PiCoffeeDuotone,
  PiCookingPotDuotone,
  PiCreditCardDuotone,
  PiEyeDuotone,
  PiEyeSlashDuotone,
  PiForkKnifeDuotone,
  PiHamburgerDuotone,
  PiInfoDuotone,
  PiLightningDuotone,
  PiListBold,
  PiMagnifyingGlassDuotone,
  PiMegaphoneDuotone,
  PiMinusBold,
  PiMoneyDuotone,
  PiPackageDuotone,
  PiPencilSimpleDuotone,
  PiPizzaDuotone,
  PiPlusBold,
  PiQuestionDuotone,
  PiReceiptDuotone,
  PiShieldCheckDuotone,
  PiSignOutDuotone,
  PiSquaresFourDuotone,
  PiStudentDuotone,
  PiTimerDuotone,
  PiTrashDuotone,
  PiUserCircleDuotone,
  PiWalletDuotone,
  PiWarningCircleDuotone,
  PiXBold,
} from 'react-icons/pi';
import type { MenuCategory, OrderStatus, PaymentMethod } from '@/lib/types';

type IconProps = { className?: string };

// The whole app uses one icon family (Phosphor, from react-icons). To change
// an icon, swap the name here and it updates everywhere.
const appIcon = (Glyph: IconType) => function AppIcon({ className = 'icon' }: IconProps) {
  return <Glyph className={className} aria-hidden="true" />;
};

export const AccountIcon = appIcon(PiUserCircleDuotone);
export const AllIcon = appIcon(PiSquaresFourDuotone);
export const ArrowLeftIcon = appIcon(PiArrowLeftBold);
export const ArrowRightIcon = appIcon(PiArrowRightBold);
export const BasketIcon = appIcon(PiBasketDuotone);
export const BellIcon = appIcon(PiBellRingingDuotone);
export const CaretLeftIcon = appIcon(PiCaretLeftBold);
export const CaretRightIcon = appIcon(PiCaretRightBold);
export const CheckIcon = appIcon(PiCheckBold);
export const CheckCircleIcon = appIcon(PiCheckCircleDuotone);
export const ClipboardIcon = appIcon(PiClipboardTextDuotone);
export const ClockIcon = appIcon(PiClockDuotone);
export const CloseIcon = appIcon(PiXBold);
export const EditIcon = appIcon(PiPencilSimpleDuotone);
export const EyeIcon = appIcon(PiEyeDuotone);
export const EyeOffIcon = appIcon(PiEyeSlashDuotone);
export const HelpIcon = appIcon(PiQuestionDuotone);
export const HistoryIcon = appIcon(PiClockCounterClockwiseDuotone);
export const InfoIcon = appIcon(PiInfoDuotone);
export const LightningIcon = appIcon(PiLightningDuotone);
export const MegaphoneIcon = appIcon(PiMegaphoneDuotone);
export const MenuBarsIcon = appIcon(PiListBold);
export const MinusIcon = appIcon(PiMinusBold);
export const PlusIcon = appIcon(PiPlusBold);
export const ReceiptIcon = appIcon(PiReceiptDuotone);
export const SearchIcon = appIcon(PiMagnifyingGlassDuotone);
export const ShieldIcon = appIcon(PiShieldCheckDuotone);
export const SignOutIcon = appIcon(PiSignOutDuotone);
export const StudentIcon = appIcon(PiStudentDuotone);
export const SwitchIcon = appIcon(PiArrowsLeftRightDuotone);
export const TimerIcon = appIcon(PiTimerDuotone);
export const TrashIcon = appIcon(PiTrashDuotone);
export const UtensilsIcon = appIcon(PiForkKnifeDuotone);
export const WalletIcon = appIcon(PiWalletDuotone);
export const WarningIcon = appIcon(PiWarningCircleDuotone);

export const CATEGORY_ICONS: Record<MenuCategory, ReturnType<typeof appIcon>> = {
  Burgers: appIcon(PiHamburgerDuotone),
  Pizza: appIcon(PiPizzaDuotone),
  Meals: appIcon(PiBowlFoodDuotone),
  Drinks: appIcon(PiCoffeeDuotone),
};

export const STATUS_ICONS: Record<OrderStatus, ReturnType<typeof appIcon>> = {
  Pending: appIcon(PiReceiptDuotone),
  Preparing: appIcon(PiCookingPotDuotone),
  Ready: appIcon(PiPackageDuotone),
  Collected: appIcon(PiCheckCircleDuotone),
};

export const PAYMENT_ICONS: Record<PaymentMethod, ReturnType<typeof appIcon>> = {
  Cash: appIcon(PiMoneyDuotone),
  Card: appIcon(PiCreditCardDuotone),
  EFT: appIcon(PiBankDuotone),
  InstantEFT: appIcon(PiLightningDuotone),
};

export function LogoMark({ className = 'logo-mark' }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <rect width="32" height="32" rx="8" fill="#f5a524" />
      <path d="M7.5 13h14v6.5a5.5 5.5 0 0 1-5.5 5.5h-3a5.5 5.5 0 0 1-5.5-5.5V13Z" fill="#12293b" />
      <path d="M21.5 15h1.25a2.75 2.75 0 0 1 0 5.5H21" fill="none" stroke="#12293b" strokeWidth="2" strokeLinecap="round" />
      <path d="M11.5 6.5c-1 1.2 1 2.3 0 3.5M16.5 6.5c-1 1.2 1 2.3 0 3.5" fill="none" stroke="#12293b" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
