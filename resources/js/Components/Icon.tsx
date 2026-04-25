import CowIcon from '../../icons/cow.svg?react';
import SheepIcon from '../../icons/sheep.svg?react';
import MeatIcon from '../../icons/meat.svg?react';

const icons = {
  cow: CowIcon,
  sheep: SheepIcon,
  meat: MeatIcon,
};

type IconProps = {
  name?: string;
} & React.SVGProps<SVGSVGElement>;

export function Icon({ name, ...props }: IconProps) {
  const Component = icons[name as keyof typeof icons];

  if (!Component) return null;

  return <i className={props.className}><Component
      width={props.width}
      height={props.width}
      className={props.className}
      style={{ overflow: 'hidden' }}
      preserveAspectRatio="xMidYMid meet"
      {...props}
    /></i>;
}

type AnimalBagdeIconProps = {
  type: string;
} & React.SVGProps<SVGSVGElement>;

export function AnimalBagdeIcon({ type }: AnimalBagdeIconProps) {
    return (
      <>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-100">
          {
            type.toLowerCase().includes('cow')
            ? <Icon name="cow" width={20} height={20} className="text-emerald-700" aria-hidden />
            : type.toLowerCase().includes('sheep') ? <Icon name="sheep" width={20} height={20} className="text-amber-700" aria-hidden />
            : <i className="fa-solid fa-paw text-gray-500" aria-hidden />
          }
        </div>
      </>
    )
}


