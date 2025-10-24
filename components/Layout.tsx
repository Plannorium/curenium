import { ThemeProvider } from './ThemeProvider';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  );
}