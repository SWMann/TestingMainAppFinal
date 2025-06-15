import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Spin, Alert, Button, Card } from 'antd';
import { WarningOutlined } from '@ant-design/icons';

// Lazy load components to save initial memory
const OptimizedORBATView = lazy(() => import('./OptimizedORBATView'));
const SimpleORBATView = lazy(() => import('./SimpleORBATView'));

const SmartORBATLoader = ({ unitId }) => {
    const [useSimpleView, setUseSimpleView] = useState(false);
    const [memoryWarning, setMemoryWarning] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check available memory and performance
        checkSystemCapabilities();
    }, []);

    const checkSystemCapabilities = () => {
        try {
            // Check if we're in a memory-constrained environment
            const isLowMemory = process.env.REACT_APP_USE_SIMPLIFIED_ORBAT === 'true';

            // Check performance API if available
            if ('memory' in performance) {
                const memoryInfo = performance.memory;
                const usedMemory = memoryInfo.usedJSHeapSize;
                const totalMemory = memoryInfo.jsHeapSizeLimit;
                const memoryUsagePercent = (usedMemory / totalMemory) * 100;

                if (memoryUsagePercent > 80) {
                    setMemoryWarning(true);
                    setUseSimpleView(true);
                }
            }

            // Check device memory if available
            if ('deviceMemory' in navigator) {
                const deviceMemory = navigator.deviceMemory;
                if (deviceMemory < 4) {
                    setMemoryWarning(true);
                    setUseSimpleView(true);
                }
            }

            // Force simple view based on environment
            if (isLowMemory) {
                setUseSimpleView(true);
            }

            // Check URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('simple') === 'true') {
                setUseSimpleView(true);
            }

        } catch (error) {
            console.error('Error checking system capabilities:', error);
        }
    };

    const handleViewSwitch = () => {
        setUseSimpleView(!useSimpleView);
        setError(null);
    };

    const handleError = (error) => {
        console.error('ORBAT View Error:', error);
        setError(error.message || 'An error occurred loading the ORBAT view');

        // If the full view fails, automatically switch to simple view
        if (!useSimpleView) {
            setUseSimpleView(true);
        }
    };

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            {memoryWarning && (
                <Alert
                    message="Performance Notice"
                    description="Simplified view enabled due to system limitations. You can try the full view, but it may be slower."
                    type="warning"
                    showIcon
                    icon={<WarningOutlined />}
                    banner
                    action={
                        <Button size="small" onClick={handleViewSwitch}>
                            Try Full View
                        </Button>
                    }
                />
            )}

            {error && (
                <Alert
                    message="Error Loading ORBAT"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    onClose={() => setError(null)}
                    style={{ margin: '16px' }}
                />
            )}

            <ErrorBoundary onError={handleError}>
                <Suspense
                    fallback={
                        <div style={{
                            height: '100vh',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Card>
                                <Spin size="large" tip="Loading ORBAT viewer..." />
                            </Card>
                        </div>
                    }
                >
                    {useSimpleView ? (
                        <SimpleORBATView unitId={unitId} />
                    ) : (
                        <OptimizedORBATView unitId={unitId} />
                    )}
                </Suspense>
            </ErrorBoundary>

            {!memoryWarning && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 1000
                }}>
                    <Button
                        type="default"
                        size="small"
                        onClick={handleViewSwitch}
                    >
                        Switch to {useSimpleView ? 'Full' : 'Simple'} View
                    </Button>
                </div>
            )}
        </div>
    );
};

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ORBAT ErrorBoundary caught:', error, errorInfo);
        if (this.props.onError) {
            this.props.onError(error);
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px' }}>
                    <Alert
                        message="Component Error"
                        description="The ORBAT viewer encountered an error. Switching to simple view..."
                        type="error"
                        showIcon
                    />
                </div>
            );
        }

        return this.props.children;
    }
}

export default SmartORBATLoader;