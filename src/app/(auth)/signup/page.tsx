import SignupForm from "@/components/auth/SignupForm";
import Link from "next/link";

export default function SignupPage() {
  return (
    <>
      <h2 className="text-2xl font-bold mb-6">Create Account</h2>
      <SignupForm />
      <div className="mt-6 text-center text-sm text-[#c8c4bc]/50">
        Already have an account?{" "}
        <Link href="/login" className="text-[#8b3a2a] hover:text-[#8b3a2a] transition-colors font-medium">
          Log in
        </Link>
      </div>
    </>
  );
}
