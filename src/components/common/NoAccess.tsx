import { Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const NoAccess = () => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-[60vh] w-full">
      <div className="flex flex-col items-center justify-center space-y-6 p-8 max-w-md text-center">
        <div className="rounded-full bg-muted p-6">
          <Lock className="w-16 h-16 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">
            {t('access.noAccess.title')}
          </h2>
          <p className="text-muted-foreground text-base">
            {t('access.noAccess.message')}
          </p>
        </div>
      </div>
    </div>
  );
};
