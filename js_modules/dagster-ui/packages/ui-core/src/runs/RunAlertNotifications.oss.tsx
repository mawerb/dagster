// js_modules/dagster-ui/packages/ui-core/src/runs/RunAlertNotifications.oss.tsx
import {Button, Icon, Tooltip} from '@dagster-io/ui-components';
import {useEffect, useMemo, useState} from 'react';

import {useMutation} from '../apollo-client';
import {showSharedToaster} from '../app/DomUtils';
import {getBrowserId} from '../app/getBrowserId';
import {SUBSCRIBE_TO_NOTIFICATIONS_MUTATION} from './RunUtils';

export const RunAlertNotifications = (
  {runId, runSubscribers}: {runId: string; runSubscribers: string[]},
) => {
  const [subscribers, setSubscribers] = useState<string[]>(runSubscribers);
  const [loading, setLoading] = useState(false);
  const [browserId, setBrowserId] = useState<string | null>(() =>
    getBrowserId({createIfMissing: false}),
  );

  const [subscribeToNotifications] = useMutation(SUBSCRIBE_TO_NOTIFICATIONS_MUTATION);

  useEffect(() => {
    setSubscribers(runSubscribers);
  }, [runSubscribers]);

  const isSubscribed = useMemo(() => {
    return browserId ? subscribers.includes(browserId) : false;
  }, [browserId, subscribers]);

  const toggleSubscription = async () => {
    setLoading(true);
    const resolvedBrowserId = getBrowserId();
    if (!resolvedBrowserId) {
      await showSharedToaster({
        intent: 'danger',
        icon: 'warning',
        message: 'Unable to access browser storage for notifications.',
      });
      setLoading(false);
      return;
    }

    if (!browserId) {
      setBrowserId(resolvedBrowserId);
    }

    const subscribe = !isSubscribed;
    const result = await subscribeToNotifications({
      variables: {runId, subscribe, browserId: resolvedBrowserId},
    });
    const data = result.data?.subscribeToNotifications;

    if (data?.__typename === 'SubscribeToNotificationsSuccess') {
      setSubscribers((prev) =>
        subscribe ? [...prev, resolvedBrowserId] : prev.filter((id) => id !== resolvedBrowserId),
      );
      await showSharedToaster({
        intent: 'success',
        icon: 'check_circle',
        message: subscribe ? 'Subscribed to run notifications.' : 'Unsubscribed from run notifications.',
      });
    } else {
      await showSharedToaster({
        intent: 'danger',
        icon: 'warning',
        message: 'Unable to update notification preference.',
      });
    }

    setLoading(false);
  };

  const tooltipText = 'Get notified when this run completes';

  return (
    <Tooltip content={tooltipText}>
      <Button
        icon={<Icon name="notifications" />}
        intent={isSubscribed ? 'primary' : 'none'}
        loading={loading}
        onClick={toggleSubscription}
      >
        {isSubscribed ? 'Subscribed' : 'Notify me'}
      </Button>
    </Tooltip>
  );
};
