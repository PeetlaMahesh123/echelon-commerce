import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container mx-auto px-4 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <h3 className="font-display text-lg tracking-[0.3em] text-gold uppercase mb-4">Aurum</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Curated luxury for the discerning individual. Timeless elegance meets modern sophistication.
          </p>
        </div>
        {[
          { title: "Shop", links: [["All Products", "/shop"], ["New Arrivals", "/shop?category=All"], ["Sale", "/shop"]] },
          { title: "Support", links: [["Contact", "#"], ["Shipping", "#"], ["Returns", "#"]] },
          { title: "Company", links: [["About", "#"], ["Careers", "#"], ["Press", "#"]] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-xs tracking-[0.2em] uppercase text-foreground mb-4">{col.title}</h4>
            <ul className="space-y-2">
              {col.links.map(([label, path]) => (
                <li key={label}>
                  <Link to={path} className="text-xs text-muted-foreground hover:text-gold transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="line-gold mt-12 mb-6" />
      <p className="text-[10px] text-muted-foreground text-center tracking-[0.1em]">
        © 2026 AURUM. All rights reserved.
      </p>
    </div>
  </footer>
);

export default Footer;
