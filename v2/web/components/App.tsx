import * as React from 'react';
import { useReducer, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Preview } from './Preview';
import { Search } from './Search';
import { Welcome } from './Welcome';
import { Outline } from './Outline';
import { History } from './History';
import { Guide } from './Guide';
import { Notification } from './Notification';
import { sendMessage } from '../ipc';
import { INITIAL_STATE, reducer } from '../reducer';
import type { GlobalDispatcher } from '../dispatcher';

// Note: `CssBaseline` is not available since it sets `background-color` and prevents vibrant window.

const LIGHT_THEME = createTheme({ palette: { mode: 'light' } });
const DARK_THEME = createTheme({ palette: { mode: 'dark' } });

interface Props {
    dispatcher: GlobalDispatcher;
}

export const App: React.FC<Props> = ({ dispatcher }) => {
    const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
    const {
        previewTree,
        searching,
        searchIndex,
        matcher,
        outline,
        appearance,
        history,
        files,
        help,
        notifying,
        notification,
        welcome,
        homeDir,
        headings,
        currentPath,
    } = state;
    const { theme, hasTitle, vibrant } = appearance;

    let searchInput;
    if (searching && !welcome) {
        searchInput = (
            <Search index={searchIndex} total={previewTree.matchCount} matcher={matcher} dispatch={dispatch} />
        );
    }

    let welcomePage;
    if (welcome) {
        welcomePage = <Welcome titleBar={!hasTitle} />;
    }

    let outlineDialog;
    if (outline && !welcome) {
        outlineDialog = <Outline dispatch={dispatch} />;
    }

    let historyDialog;
    if (history) {
        historyDialog = <History history={files} homeDir={homeDir} dispatch={dispatch} />;
    }

    let guideDialog;
    if (help) {
        guideDialog = <Guide shortcuts={dispatcher.keymap.shortcuts} dispatcher={dispatcher} />;
    }

    useEffect(() => {
        dispatcher.setDispatch(dispatch, state);
    });
    useEffect(() => {
        sendMessage({ kind: 'init' });
    }, []); // Run only when component was mounted

    return (
        <ThemeProvider theme={theme === 'light' ? LIGHT_THEME : DARK_THEME}>
            <Preview
                tree={previewTree}
                headings={headings}
                path={currentPath}
                titleBar={!hasTitle}
                vibrant={vibrant}
                dispatch={dispatch}
            />
            {searchInput}
            {outlineDialog}
            {historyDialog}
            {guideDialog}
            {welcomePage}
            <Notification open={notifying} content={notification} dispatch={dispatch} />
        </ThemeProvider>
    );
};
