import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface PlaceholderScreenProps {
  title: string;
  children?: ReactNode;
}

export function PlaceholderScreen({ title, children }: PlaceholderScreenProps) {
  return (
    <section className="screen">
      <h1>{title}</h1>
      {children}
      <p>
        <Link to="/">← Home</Link>
      </p>
    </section>
  );
}
