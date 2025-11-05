"use client";

export default function Home() {
  return (
    <div>
   <section className="hero">
  <h1>מערכת ניהול משימות חכמה לארגונים וצוותים</h1>
  <p>
    פתרון מקיף לניהול פרויקטים, תעדוף משימות ושיתופי פעולה — במקום אחד יעיל ומסודר.
  </p>
  <button>התחילו עכשיו</button>
  <div className="hero-image">
    <img src="/screenshot.png" alt="תצוגת מערכת הניהול" />
  </div>
</section>

      <section className="features">
  <h2>כל מה שצוות צריך כדי לעבוד ביעילות</h2>
  <div className="feature-grid">
    <div>
      <h3>ניהול פרויקטים</h3>
      <p>צרו, תכננו ונטרו משימות בצורה שקופה ומדויקת לכל חברי הצוות.</p>
    </div>
    <div>
      <h3>שיתופי פעולה בזמן אמת</h3>
      <p>עבדו יחד על משימות, הגיבו, והישארו מסונכרנים — בכל זמן ובכל מקום.</p>
    </div>
    <div>
      <h3>בקרה ודוחות מתקדמים</h3>
      <p>קבלו תובנות על ביצועים, עמידה ביעדים ויעילות תהליכים.</p>
    </div>
  </div>
</section>

  <section className="cta">
  <h2>הובילו את הצוות שלכם להצלחה</h2>
  <p>הצטרפו עכשיו למערכת ניהול משימות ארגונית שמעצימה תהליכי עבודה.</p>
  <button>צרו חשבון ארגוני</button>
</section>

    </div>
  );
}
