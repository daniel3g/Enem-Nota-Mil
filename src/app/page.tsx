import Image from "next/image";

export default function Home() {
  return (
    <Image
      src="/logo.webp"
      width={200}
      height={500}
      alt="logo Enem Nota Mil"
    />
  );
}
