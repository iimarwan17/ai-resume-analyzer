import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

export const meta = () => ([
    { title: 'ResumI | Auth' },
    { name: 'description', content: 'Log inro your account' }
])

const Auth = () => {
    const { isLoading, auth } = usePuterStore();
    const location = useLocation();
    const nextPage = location.search.split('next=')[1];                  // give me the next page from the current page.
    const navigate = useNavigate();

    useEffect(() => {
        if (auth.isAuthenticated) navigate(nextPage);
    }, [auth.isAuthenticated, nextPage]);

    return (
        <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center">
            <div className="gradient-border shadow-lg">
                <section className="flex flex-col gap-8 bg-white rounded-2xl p-10">
                    <div className="flex flex-col items-center gap-2 text-center">
                        <h1>Welcome</h1>
                        <h2>Log in to Countinue Your Job Journey</h2>
                    </div>
                    {isLoading ? (
                        <button className="auth-button animate-pulse">
                            <p>Signing you in...</p>
                        </button>
                    ) : (
                        <>
                            {auth.isAuthenticated ? (
                                <button className="auth-button" onClick={auth.signOut}>
                                    <p>Log out</p>
                                </button>
                            ) : (
                                <button className="auth-button" onClick={auth.signIn}>
                                    <p>Login</p>
                                </button>
                            )}
                        </>
                    )}
                </section>
            </div>
        </main>
    )
}

export default Auth
