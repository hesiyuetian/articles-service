const path = require('path');
const serviceName = path.basename(__dirname);

module.exports = {
    apps: [
        {
            // Application name
            name: serviceName,

            // Use npm to start the application
            script: 'npm',
            args: 'start:prod',

            // Working directory - use relative path for portability
            cwd: path.resolve(process.cwd()),

            // Number of instances (1 for development, 'max' for production)
            instances: 1,

            // Auto restart on crash
            autorestart: true,

            // Watch for file changes (disabled for production)
            watch: false,
            ignore_watch: ['node_modules', 'logs', '.git'],

            // Restart if memory usage exceeds 1GB
            max_memory_restart: '1G',

            // Logging configuration
            error_file: './logs/err.log',
            out_file: './logs/out.log',
            log_file: './logs/combined.log',
            time: true,
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            merge_logs: true,

            // Restart configuration
            max_restarts: 10,
            min_uptime: '10s',
            restart_delay: 4000,

            // Process management
            kill_timeout: 5000,
            listen_timeout: 3000,
            wait_ready: true,
            ready_timeout: 10000,

            // Advanced options
            node_args: '--max-old-space-size=1024',
            exec_mode: 'fork',

            // Health monitoring
            health_check_grace_period: 3000,
            health_check_fatal_exceptions: true,
        },
    ],
};
