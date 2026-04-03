export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-30%] left-[-10%] w-[500px] h-[500px] rounded-full bg-vine/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-5%] w-[400px] h-[400px] rounded-full bg-gold/5 blur-[100px] pointer-events-none" />
      {children}
    </div>
  );
}
