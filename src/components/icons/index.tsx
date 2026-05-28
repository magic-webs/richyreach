const Icons = {
    Home: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
    ),
    Marketplace: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
    Dashboard: () =>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>,
    Calculator: () =>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 11h.01M12 7h.01M9 11h.01M12 14h.01M15 11h.01M15 7h.01M5 19V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2z" />
        </svg>,
    Chat: () =>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>,
    Profile: () =>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>,
    Admin: () =>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>,
    Settings: () =>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>,
    Earnings: () =>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.3942 3.00083L14.1481 2.79115C12.9103 1.73628 11.0897 1.73628 9.85189 2.79115L9.60584 3.00083C8.96518 3.54679 8.16862 3.87674 7.32956 3.9437L7.00731 3.96941C5.38613 4.09878 4.09878 5.38613 3.96941 7.00731L3.9437 7.32956C3.87674 8.16862 3.54679 8.96518 3.00083 9.60584L2.79115 9.85189C1.73628 11.0897 1.73628 12.9103 2.79115 14.1481L3.00083 14.3942C3.54679 15.0348 3.87674 15.8314 3.9437 16.6704L3.96941 16.9927C4.09878 18.6139 5.38613 19.9012 7.00731 20.0306L7.32956 20.0563C8.16862 20.1233 8.96518 20.4532 9.60584 20.9992L9.85188 21.2089C11.0897 22.2637 12.9103 22.2637 14.1481 21.2089L14.3942 20.9992C15.0348 20.4532 15.8314 20.1233 16.6704 20.0563L16.9927 20.0306C18.6139 19.9012 19.9012 18.6139 20.0306 16.9927L20.0563 16.6704C20.1233 15.8314 20.4532 15.0348 20.9992 14.3942L21.2089 14.1481C22.2637 12.9103 22.2637 11.0897 21.2089 9.85188L20.9992 9.60584C20.4532 8.96518 20.1233 8.16862 20.0563 7.32956L20.0306 7.00731C19.9012 5.38613 18.6139 4.09878 16.9927 3.96941L16.6704 3.9437C15.8314 3.87674 15.0348 3.54679 14.3942 3.00083Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 8C11.933 8 13.5 9.567 13.5 11.5C13.5 13.433 11.933 15 10 15H9L14 16M9 11.5H16M9 8H16" />
        </svg>

};

export default Icons;