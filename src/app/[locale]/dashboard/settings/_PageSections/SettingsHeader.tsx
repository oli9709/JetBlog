import { getTranslations } from 'next-intl/server';

const SettingsHeader = async () => {
  const t = await getTranslations('Dashboard');
  return (
    <div className="space-y-0.5">
      <h2 className="text-2xl font-bold tracking-tight">{t('navSettings')}</h2>
      <p className="text-muted-foreground">{t('settingsSubtitle')}</p>
    </div>
  );
};

export default SettingsHeader;
