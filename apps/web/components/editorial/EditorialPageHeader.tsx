import styles from "./EditorialPages.module.css";

type EditorialPageHeaderProps = {
  index: string;
  title: string;
  label: string;
  description?: string;
};

export function EditorialPageHeader({
  index,
  title,
  label,
  description,
}: EditorialPageHeaderProps) {
  return (
    <header className={styles.pageHeader}>
      <div className={styles.headerTop}>
        <span className="eyebrow">{index} / STUDIO ELYSIAN</span>
        <span className={styles.headerLabel}>{label}</span>
      </div>
      <div className={styles.headerMain}>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </header>
  );
}
