module.exports = {
  apps: [
    {
      name: 'moon-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/home/jw/src/moonplace/moon-pixelmap-frontend-nextjs',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_file: '/home/jw/src/moonplace/moon-pixelmap-frontend-nextjs/.env.local',
      instances: 1,
      exec_mode: 'fork',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};