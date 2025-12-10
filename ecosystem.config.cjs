module.exports = {
  apps: [
    {
      name: 'moon-frontend',
      script: 'npm',
      args: 'start',
      // cwd: './', // Uses current directory where command is run
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      env_file: './.env.local',
      instances: 1,
      exec_mode: 'fork',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};