import type { HTMLAttributes } from 'react'
import { cx } from '../lib/cx'

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx('rounded-xl border border-mist bg-white', className)} {...rest} />
}
