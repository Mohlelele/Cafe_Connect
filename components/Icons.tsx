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
  PiChatCircleTextDuotone,
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
  PiLeafDuotone,
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
  PiStarFill,
  PiStudentDuotone,
  PiTimerDuotone,
  PiTrashDuotone,
  PiUploadSimpleBold,
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
export const ChatIcon = appIcon(PiChatCircleTextDuotone);
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
export const LeafIcon = appIcon(PiLeafDuotone);
export const LightningIcon = appIcon(PiLightningDuotone);
export const MegaphoneIcon = appIcon(PiMegaphoneDuotone);
export const MenuBarsIcon = appIcon(PiListBold);
export const MinusIcon = appIcon(PiMinusBold);
export const PlusIcon = appIcon(PiPlusBold);
export const ReceiptIcon = appIcon(PiReceiptDuotone);
export const SearchIcon = appIcon(PiMagnifyingGlassDuotone);
export const ShieldIcon = appIcon(PiShieldCheckDuotone);
export const SignOutIcon = appIcon(PiSignOutDuotone);
export const StarIcon = appIcon(PiStarFill);
export const StudentIcon = appIcon(PiStudentDuotone);
export const SwitchIcon = appIcon(PiArrowsLeftRightDuotone);
export const TimerIcon = appIcon(PiTimerDuotone);
export const TrashIcon = appIcon(PiTrashDuotone);
export const UploadIcon = appIcon(PiUploadSimpleBold);
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

// The Cafe Connect logo. Small web versions of the original artwork live in
// public/brand (the original is in design/).

// The cup and Wi-Fi icon on a navy tile. Used next to the name on light backgrounds.
export function LogoMark({ className = 'logo-mark' }: IconProps) {
  // eslint-disable-next-line @next/next/no-img-element -- an 8 KB icon does not need image optimisation.
  return <img src="/brand/logo-mark.png" alt="" width={34} height={34} className={className} />;
}

// The full logo with its name. Its white lettering is made for dark backgrounds.
export function LogoFull({ className = 'logo-full' }: IconProps) {
  // eslint-disable-next-line @next/next/no-img-element -- already sized and compressed (51 KB).
  return <img src="/brand/logo-full.webp" alt="Cafe Connect" width={640} height={254} className={className} />;
}
