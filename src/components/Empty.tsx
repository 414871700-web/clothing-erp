import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Empty component
export default function Empty() {
  return (
    <div className={cn('flex h-full items-center justify-center')}>Empty</div>
  )
}
