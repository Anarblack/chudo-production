import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 28, filter: 'blur(10px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function AboutSection() {
  return (
    <section id="about" className="about-section" aria-labelledby="about-title">
      <div className="about-grain" aria-hidden="true" />

      <motion.div
        className="about-header"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
        variants={fadeUp}
      >
        <span className="about-eyebrow">О нас</span>
        <h2 id="about-title" className="about-title">[заголовок здесь]</h2>
        <p className="about-subtitle">[подзаголовок здесь]</p>
      </motion.div>

      <motion.div
        className="about-grid"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={stagger}
      >
        <motion.article className="about-block" id="about-portfolio" variants={fadeUp}>
          <span className="about-block__num">01</span>
          <strong className="about-block__title">Портфолио</strong>
          <span className="about-block__status">coming soon</span>
        </motion.article>

        <motion.article className="about-block" id="about-introduction" variants={fadeUp}>
          <span className="about-block__num">02</span>
          <strong className="about-block__title">Знакомство</strong>
          <span className="about-block__status">coming soon</span>
        </motion.article>

        <motion.article className="about-block" id="about-backstage" variants={fadeUp}>
          <span className="about-block__num">03</span>
          <strong className="about-block__title">Бэкстейдж</strong>
          <span className="about-block__status">coming soon</span>
        </motion.article>

        <motion.article className="about-block" id="about-ideology" variants={fadeUp}>
          <span className="about-block__num">04</span>
          <strong className="about-block__title">Идеология команды</strong>
          <span className="about-block__status">coming soon</span>
        </motion.article>

        <motion.article className="about-block" id="about-team" variants={fadeUp}>
          <span className="about-block__num">05</span>
          <strong className="about-block__title">Наши люди</strong>
          <span className="about-block__status">coming soon</span>
        </motion.article>
      </motion.div>

      <motion.div
        className="about-cta"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <a href="#contact" className="button button--primary">Связаться с нами</a>
      </motion.div>
    </section>
  );
}
