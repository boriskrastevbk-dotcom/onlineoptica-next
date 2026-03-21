import Link from "next/link";
import Image from "next/image";

type Card = {
  title: string;
  href: string;
  src: string;
  alt: string;
};

const cards: Card[] = [
  {
    title: "Мъжки рамки",
    href: "/c/мъжки-рамки",
    src: "/cards/men.png",
    alt: "Мъжки диоптрични рамки",
  },
  {
    title: "Дамски рамки",
    href: "/c/дамски-рамки",
    src: "/cards/women.png",
    alt: "Дамски диоптрични рамки",
  },
  {
    title: "Детски рамки",
    href: "/c/детски-рамки",
    src: "/cards/kids.png",
    alt: "Детски диоптрични рамки",
  },
  {
    title: "Слънчеви очила",
    href: "/c/слънчеви-очила",
    src: "/cards/sunglasses.png",
    alt: "Слънчеви очила",
  },
];
export default function CategoryCards() {
  return (
    <section className="catcards" aria-label="Категории">
      {cards.map((c) => (
        <Link key={c.href} href={c.href} className="catcard">
          <span className="catcard-media" aria-hidden="true">
            <Image src={c.src} alt={c.alt} fill sizes="(max-width: 899px) 50vw, 25vw" />
          </span>
          <span className="catcard-title">{c.title}</span>
        </Link>
      ))}
    </section>
  );
}

