/**
 * PM2 Ecosystem Config — PromptCraft AI
 *
 * Must use .cjs extension because the project is "type": "module".
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs              # start production
 *   pm2 start ecosystem.config.cjs --env dev    # start dev (single instance, watch)
 *   pm2 reload ecosystem.config.cjs             # zero-downtime reload
 *   pm2 stop promptcraft                        # stop
 *   pm2 logs promptcraft                        # tail logs
 *   pm2 monit                                   # live dashboard
 */

module.exports = {
  apps: [
    {
      name: 'promptcraft',
      script: 'src/api/server.js',

      // ── Cluster mode ─────────────────────────────────────────────────────
      // "max" uses all available CPU cores. Set a fixed number if you want to
      // reserve cores for other processes (e.g., 4 on an 8-core machine).
      instances: 'max',
      exec_mode: 'cluster',

      // ── Stability ─────────────────────────────────────────────────────────
      max_memory_restart: '512M',   // restart if a worker exceeds 512 MB
      min_uptime: '10s',            // must stay up ≥10s to count as stable
      max_restarts: 10,             // give up after 10 crashes in a row
      restart_delay: 2000,          // wait 2s between restart attempts
      autorestart: true,
      watch: false,                 // never watch in production (use reload)

      // ── Logging ───────────────────────────────────────────────────────────
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      merge_logs: true,             // merge cluster workers into one log file
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      // Rotate logs when they reach 10 MB (requires pm2-logrotate module)
      // Install once:  pm2 install pm2-logrotate
      // Config:        pm2 set pm2-logrotate:max_size 10M
      //                pm2 set pm2-logrotate:retain 7

      // ── Environment: production (default) ────────────────────────────────
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },

      // ── Environment: development ──────────────────────────────────────────
      env_dev: {
        NODE_ENV: 'development',
        PORT: 3000,
        instances: 1,
        watch: true,
        ignore_watch: ['node_modules', 'logs', 'public'],
      },
    },
  ],
};
