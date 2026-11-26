import React from 'react';
import { FaqItem } from '../../../components/FaqItem';
import { SettingsPage } from '../../../components/SettingsPage';
import { SettingsRow } from '../../../components/SettingsRow';
import { SettingsSection } from '../../../components/SettingsSection';
import { FAQ, SUPPORT_EMAIL, SUPPORT_WHATSAPP } from '../../../constants/supportInfo';
import { linkHandler } from '../../../utils/linkHandler';

// Settings → Help & support: common questions and how to reach Taskly.
// Contact rows say "Coming soon" until the details are set in supportInfo.ts.
export function HelpSupportScreen() {
  return (
    <SettingsPage title="Help & support">
      <SettingsSection title="Common questions">
        {FAQ.map((item) => (
          <FaqItem key={item.question} question={item.question} answer={item.answer} />
        ))}
      </SettingsSection>

      <SettingsSection title="Contact us">
        <SettingsRow
          icon="logo-whatsapp"
          label="Chat on WhatsApp"
          value={SUPPORT_WHATSAPP ? undefined : 'Coming soon'}
          onPress={linkHandler(SUPPORT_WHATSAPP && `https://wa.me/${SUPPORT_WHATSAPP}`)}
        />
        <SettingsRow
          icon="mail-outline"
          label="Email support"
          value={SUPPORT_EMAIL ? undefined : 'Coming soon'}
          onPress={linkHandler(SUPPORT_EMAIL && `mailto:${SUPPORT_EMAIL}`)}
        />
      </SettingsSection>
    </SettingsPage>
  );
}
