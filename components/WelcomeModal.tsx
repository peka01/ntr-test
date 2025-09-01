
import React, { useEffect } from 'react';
import type { User } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface WelcomeModalProps {
    user: User;
    onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ user, onClose }) => {
    const { t } = useTranslations();
    const [size, setSize] = React.useState({ width: 480, height: 420 });
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    const modalRef = React.useRef<HTMLDivElement>(null);
    const [isResizing, setIsResizing] = React.useState(false);
    const [resizeDirection, setResizeDirection] = React.useState<string>('');
    const [resizeStartPos, setResizeStartPos] = React.useState({ x: 0, y: 0 });
    const [resizeStartSize, setResizeStartSize] = React.useState({ width: 0, height: 0 });
    const [resizeStartPosition, setResizeStartPosition] = React.useState({ x: 0, y: 0 });
    const handleResizeStart = (e: React.MouseEvent, direction: string) => {
        e.stopPropagation();
        console.log('WelcomeModal resize started:', direction, 'at:', { x: e.clientX, y: e.clientY });
        setResizeDirection(direction);
        setResizeStartPos({ x: e.clientX, y: e.clientY });
        setResizeStartSize({ width: size.width, height: size.height });
        setResizeStartPosition({ x: position.x, y: position.y });
        setIsResizing(true);
    };
    const handleResizeMove = (e: MouseEvent) => {
        if (isResizing && modalRef.current) {
            const rect = modalRef.current.getBoundingClientRect();
            const deltaX = e.clientX - resizeStartPos.x;
            const deltaY = e.clientY - resizeStartPos.y;
            
            let newWidth = resizeStartSize.width;
            let newHeight = resizeStartSize.height;
            let newX = resizeStartPosition.x;
            let newY = resizeStartPosition.y;

            if (resizeDirection.includes('e')) {
                newWidth = resizeStartSize.width + deltaX;
            }
            if (resizeDirection.includes('w')) {
                newWidth = resizeStartSize.width - deltaX;
                newX = resizeStartPosition.x + deltaX;
            }
            if (resizeDirection.includes('s')) {
                newHeight = resizeStartSize.height + deltaY;
            }
            if (resizeDirection.includes('n')) {
                newHeight = resizeStartSize.height - deltaY;
                newY = resizeStartPosition.y + deltaY;
            }

            const minW = 360;
            const minH = 300;
            const maxW = window.innerWidth - 20;
            const maxH = window.innerHeight - 20;
            
            newWidth = Math.max(minW, Math.min(maxW, newWidth));
            newHeight = Math.max(minH, Math.min(maxH, newHeight));
            
            // Ensure position stays within viewport bounds
            newX = Math.max(10, Math.min(window.innerWidth - newWidth - 10, newX));
            newY = Math.max(10, Math.min(window.innerHeight - newHeight - 10, newY));

            console.log('WelcomeModal resize move:', { deltaX, deltaY, newWidth, newHeight, newX, newY });
            
            setSize({ width: newWidth, height: newHeight });
            setPosition({ x: newX, y: newY });
        }
    };
    const handleResizeEnd = () => {
        setIsResizing(false);
        setResizeDirection('');
    };
    React.useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleResizeMove);
            document.addEventListener('mouseup', handleResizeEnd);
            return () => {
                document.removeEventListener('mousemove', handleResizeMove);
                document.removeEventListener('mouseup', handleResizeEnd);
            };
        }
    }, [isResizing, resizeDirection]);

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000); // Auto-close after 5 seconds

        return () => clearTimeout(timer);
    }, [onClose]);

    // Initialize centered position
    useEffect(() => {
        const centerX = (window.innerWidth - size.width) / 2;
        const centerY = (window.innerHeight - size.height) / 2;
        setPosition({ x: centerX, y: centerY });
    }, []);

    // The user object passed here is from before the state update,
    // so we subtract 1 from the balance to show the correct new total.
    const newBalance = user.voucherBalance > 0 ? user.voucherBalance - 1 : 0;

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-50 animate-fade-in">
            <div 
                ref={modalRef} 
                style={{ 
                    width: `${size.width}px`, 
                    height: `${size.height}px`,
                    left: `${position.x}px`,
                    top: `${position.y}px`
                }} 
                className="absolute bg-white rounded-2xl p-8 md:p-12 border border-slate-200 shadow-2xl text-center relative select-none"
            >
                <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-cyan-600 mb-4">
                    {t('welcomeMessage', { name: user.name })}
                </h2>
                <p className="text-slate-600 text-lg mb-6">
                    {t('welcomeSubMessage')}
                </p>
                <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
                    <p className="text-slate-500">{t('welcomeBalanceLabel')}</p>
                    <p className="text-slate-900 text-3xl font-bold">{newBalance}</p>
                </div>
                <button
                    onClick={onClose}
                    className="mt-8 w-full px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-cyan-500 hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-cyan-500 transition-colors duration-200"
                >
                    {t('welcomeCloseBtn')}
                </button>
                {/* Resize handles (edges + corners) */}
                {/* Edges */}
                <div className="absolute top-0 left-2 right-2 h-2 cursor-n-resize z-50 hover:bg-blue-500 hover:opacity-30" onMouseDown={(e) => handleResizeStart(e, 'n')} />
                <div className="absolute bottom-0 left-2 right-2 h-2 cursor-s-resize z-50 hover:bg-blue-500 hover:opacity-30" onMouseDown={(e) => handleResizeStart(e, 's')} />
                <div className="absolute top-2 bottom-2 left-0 w-2 cursor-w-resize z-50 hover:bg-blue-500 hover:opacity-30" onMouseDown={(e) => handleResizeStart(e, 'w')} />
                <div className="absolute top-2 bottom-2 right-0 w-2 cursor-e-resize z-50 hover:bg-blue-500 hover:opacity-30" onMouseDown={(e) => handleResizeStart(e, 'e')} />
                {/* Corners */}
                <div className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize z-50 hover:bg-blue-500 hover:opacity-50" onMouseDown={(e) => handleResizeStart(e, 'nw')} />
                <div className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize z-50 hover:bg-blue-500 hover:opacity-50" onMouseDown={(e) => handleResizeStart(e, 'ne')} />
                <div className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize z-50 hover:bg-blue-500 hover:opacity-50" onMouseDown={(e) => handleResizeStart(e, 'sw')} />
                <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-50 hover:bg-blue-500 hover:opacity-50" onMouseDown={(e) => handleResizeStart(e, 'se')} />
            </div>
        </div>
    );
};