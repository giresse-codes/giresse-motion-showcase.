import React, {createContext, useContext} from 'react';
import {GMotionClient, gmotionClients} from '../config';
import {ClientPalette, clientPalettes} from '../theme';

type ClientInfo = {client: GMotionClient; palette: ClientPalette};

const ClientContext = createContext<ClientInfo | null>(null);

export const getClient = (compositionId: string): ClientInfo => {
	const client = gmotionClients.find((c) => c.compositionId === compositionId) ?? gmotionClients[0];
	return {client, palette: clientPalettes[client.palette] ?? clientPalettes.nova};
};

export const ClientProvider: React.FC<{compositionId: string; children: React.ReactNode}> = ({compositionId, children}) => (
	<ClientContext.Provider value={getClient(compositionId)}>{children}</ClientContext.Provider>
);

/** Client fictif (textes + charte graphique) de la pub en cours */
export const useClient = (): ClientInfo => {
	const info = useContext(ClientContext);
	if (!info) throw new Error('useClient doit être utilisé dans <ClientProvider>');
	return info;
};
