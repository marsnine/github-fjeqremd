import React from 'react';

export interface LinkProps {
  href: string;
  className?: string;
  children: React.ReactNode;
}

export function Link({ href, className, children }: LinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // 실제 라우팅 구현 시 여기에 구현
    console.log(`Navigate to: ${href}`);
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
