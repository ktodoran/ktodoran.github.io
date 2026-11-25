import { person } from '../content/profile.js';

export default function Contact() {
  const links = [
    { label: 'Email', text: person.email, href: `mailto:${person.email}` },
    { label: 'LinkedIn', text: 'linkedin.com/in/ktodoran', href: person.linkedin },
    { label: 'GitHub', text: 'github.com/ktodoran', href: person.github },
    { label: 'Resume', text: 'Download the PDF', href: person.resume },
  ];

  return (
    <section className="block" id="contact" aria-labelledby="contact-title">
      <div className="wrap">
        <h2 id="contact-title">Contact</h2>
        <dl className="contact">
          {links.map((link) => (
            <div key={link.label}>
              <dt>{link.label}</dt>
              <dd>
                <a href={link.href}>{link.text}</a>
              </dd>
            </div>
          ))}
          <div>
            <dt>Location</dt>
            <dd>{person.location}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
