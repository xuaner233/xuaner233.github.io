import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const sections = [
  {
    number: '01',
    title: 'Docs',
    description: 'Useful references and resources, collected in one place.',
    to: '/docs',
    link: 'Explore the docs',
  },
  {
    number: '02',
    title: 'Blog',
    description: 'Notes, experiments, and lessons from building and learning.',
    to: '/blog',
    link: 'Read the blog',
  },
  {
    number: '03',
    title: 'About',
    description: 'A little more about the person behind this space.',
    to: '/about',
    link: 'Get to know me',
  },
];

export default function Home() {
  return (
    <Layout description="A personal space for notes and discoveries">
      <main>
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>A PERSONAL SPACE FOR CURIOSITY</p>
            <h1>Welcome to<br /><span>Xiaoxuan's World.</span></h1>
            <p className={styles.intro}>
              A place to collect ideas, share what I learn, and explore the world one step at a time.
            </p>
            <div className={styles.actions}>
              <Link className={styles.primaryButton} to="/blog">Explore the blog <span aria-hidden="true">→</span></Link>
              <Link className={styles.secondaryButton} to="/docs">Browse docs <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
          <p className={styles.credit}>
            M33 · <a href="https://science.nasa.gov/image-detail/amf-cf66fd65-22d4-4502-bd82-bd9d15feb7d2/">X-ray: NASA/CXC/SAO; Optical: ESO/VLT; UV: NASA/Swift; Image Processing: NASA/CXC/SAO/L. Frattare</a>
          </p>
        </header>
        <section className={styles.discover}>
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>MAKE YOURSELF AT HOME</p>
              <h2>A space for exploring.</h2>
            </div>
            <p>From useful references to personal notes, find your own way around.</p>
          </div>
          <div className={styles.cards}>
            {sections.map((section) => (
              <Link key={section.to} to={section.to} className={styles.card}>
                <span className={styles.cardNumber}>{section.number} /</span>
                <h3>{section.title}</h3>
                <p>{section.description}</p>
                <span className={styles.cardLink}>{section.link} <span aria-hidden="true">↗</span></span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
