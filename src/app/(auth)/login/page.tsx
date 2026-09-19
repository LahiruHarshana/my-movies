import LoginForm from "@/components/auth/LoginForm";
import Link from "next/link";

export default function LoginPage() {
  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Welcome Back</h2>
      <LoginForm />
      <div className="mt-6 text-center text-sm text-[#c8c4bc]/50">
        Don't have an account?{" "}
        <Link href="/signup" className="text-[#8b3a2a] hover:text-[#8b3a2a] transition-colors font-medium">
          Sign up
        </Link>
      </div>
    </>
  );
}
