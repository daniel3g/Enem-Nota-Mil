import React from "react";
import Link from "next/link";

const RegisterButton = () => {
  return (
    <Link href="/cadastro">
      <button className="flex items-center justify-center px-8 py-2 bg-customPurple text-white rounded-3xl hover:bg-customYellow transition">
        Matricule-se Agora!
      </button>
    </Link>
  );
};

export default RegisterButton;
