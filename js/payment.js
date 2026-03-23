import { auth } from './firebase.js';
import { createNotification, savePayment, saveUser, createHallEntry, getUser } from './database.js';
import { PAYMENT_CATALOG, WALLET_ADDRESS, sleep, toast } from './utils.js';

export const createPiFeaturePayment = async (featureKey, metadata = {}) => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('No active Firebase session');
  if (!window.Pi) throw new Error('Pi SDK unavailable');

  const item = PAYMENT_CATALOG[featureKey];
  if (!item) throw new Error('Unsupported payment feature');

  const user = await getUser(currentUser.uid);
  const paymentData = {
    amount: item.amount,
    memo: `ScoutMe ${item.label}`,
    metadata: { ...metadata, featureKey, uid: currentUser.uid }
  };

  return new Promise((resolve, reject) => {
    window.Pi.createPayment(paymentData, {
      onReadyForServerApproval: async (paymentId) => {
        await savePayment(paymentId, {
          paymentId,
          uid: currentUser.uid,
          username: user?.username || 'ScoutMe user',
          featureKey,
          amount: item.amount,
          memo: paymentData.memo,
          wallet: WALLET_ADDRESS,
          status: 'server_approval_pending'
        });
        await sleep(1200);
        await savePayment(paymentId, { status: 'server_approved' });
      },
      onReadyForServerCompletion: async (paymentId, txid) => {
        await savePayment(paymentId, { status: 'completed', txid, completedAt: new Date().toISOString() });

        if (featureKey === 'boost') {
          const boostedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
          await saveUser(currentUser.uid, { boostedUntil });
        }

        if (featureKey === 'unlock_contact') {
          const unlockedContacts = metadata.targetUserId ? [metadata.targetUserId] : ['global'];
          await saveUser(currentUser.uid, { unlockedContacts });
        }

        if (featureKey === 'hall_of_fame') {
          await createHallEntry({
            playerId: currentUser.uid,
            transferValue: metadata.transferValue || `${item.amount} Pi`,
            club: metadata.club || (user?.username || 'ScoutMe'),
            sport: metadata.sport || user?.sport || 'Football'
          });
        }

        await createNotification({
          userId: currentUser.uid,
          type: 'payment',
          message: `${item.label} payment completed successfully.`
        });
        toast(`${item.label} payment completed.`, 'success');
        resolve({ paymentId, txid, featureKey });
      },
      onCancel: async (paymentId) => {
        if (paymentId) await savePayment(paymentId, { status: 'cancelled' });
        toast('Payment cancelled.', 'error');
        reject(new Error('Payment cancelled'));
      },
      onError: async (error, payment) => {
        if (payment?.identifier) await savePayment(payment.identifier, { status: 'failed', error: String(error) });
        toast(`Payment failed: ${error.message || error}`, 'error');
        reject(error);
      }
    });
  });
};
