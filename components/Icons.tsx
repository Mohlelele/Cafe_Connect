import type { IconType } from 'react-icons';
import {
  PiArrowLeftBold,
  PiArrowRightBold,
  PiBellRingingDuotone,
  PiCheckBold,
  PiClipboardTextDuotone,
  PiClockCounterClockwiseDuotone,
  PiClockDuotone,
  PiForkKnifeDuotone,
  PiInfoDuotone,
  PiLightningDuotone,
  PiMagnifyingGlassDuotone,
  PiMegaphoneDuotone,
  PiMinusBold,
  PiPlusBold,
  PiReceiptDuotone,
  PiBasketDuotone,
  PiSignOutDuotone,
  PiStudentDuotone,
  PiWalletDuotone,
} from 'react-icons/pi';

type IconProps = { className?: string };

// The whole app uses one icon family (Phosphor, from react-icons). To change
// an icon, swap the name here and it updates everywhere.
const appIcon = (Glyph: IconType) => function AppIcon({ className = 'icon' }: IconProps) {
  return <Glyph className={className} aria-hidden="true" />;
};

export const ArrowLeftIcon = appIcon(PiArrowLeftBold);
export const ArrowRightIcon = appIcon(PiArrowRightBold);
export const BasketIcon = appIcon(PiBasketDuotone);
export const BellIcon = appIcon(PiBellRingingDuotone);
export const CheckIcon = appIcon(PiCheckBold);
export const ClipboardIcon = appIcon(PiClipboardTextDuotone);
export const ClockIcon = appIcon(PiClockDuotone);
export const HistoryIcon = appIcon(PiClockCounterClockwiseDuotone);
export const InfoIcon = appIcon(PiInfoDuotone);
export const LightningIcon = appIcon(PiLightningDuotone);
export const MegaphoneIcon = appIcon(PiMegaphoneDuotone);
export const MinusIcon = appIcon(PiMinusBold);
export const PlusIcon = appIcon(PiPlusBold);
export const ReceiptIcon = appIcon(PiReceiptDuotone);
export const SearchIcon = appIcon(PiMagnifyingGlassDuotone);
export const SignOutIcon = appIcon(PiSignOutDuotone);
export const StudentIcon = appIcon(PiStudentDuotone);
export const UtensilsIcon = appIcon(PiForkKnifeDuotone);
export const WalletIcon = appIcon(PiWalletDuotone);

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
