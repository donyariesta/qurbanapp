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


