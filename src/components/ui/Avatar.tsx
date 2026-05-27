import { getImageUrl } from '../../utils/imageUtils';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base' };

export default function Avatar({ name, src, size = 'md' }: AvatarProps) {
  const resolvedSrc = getImageUrl(src, name);

  return (
    <img
      src={resolvedSrc}
      alt={name}
      className={`${sizeMap[size]} rounded-full object-cover shrink-0 bg-blue-50`}
      onError={(e) => {
        const target = e.currentTarget;
        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=e0e7ff&color=4338ca&bold=true&size=128`;
      }}
    />
  );
}
