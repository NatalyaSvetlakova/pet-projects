// Подключаем встроенный модуль Node.js для работы с путями
const path = require('path');
// Плагин для генерации HTML-файла с автоматической подстановкой скриптов
const HtmlWebpackPlugin = require('html-webpack-plugin');
// Плагин для извлечения CSS в отдельный файл (для production)
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
// Плагин для минификации CSS
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

// Экспортируем конфигурацию как функцию, которая получает аргументы командной строки
module.exports = (env, argv) => {
    // Определяем режим: production или development
    const isProduction = argv.mode === 'production';
    
    return {
        // Режим сборки
        mode: isProduction ? 'production' : 'development',
        
        // Точка входа
        entry: './src/main.js',
        
        // Настройка выходных файлов
        output: {
            filename: isProduction ? 'js/[name].[contenthash].js' : 'js/[name].js',
            path: path.resolve(__dirname, 'dist'),
            clean: true,
            publicPath: '/',
        },
        
        // Настройка source maps
        devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
        
        // Настройка дев-сервера
        devServer: {
            static: './dist',
            hot: true,
            port: 5500,
            open: true,
            historyApiFallback: true,
            client: {
                overlay: {
                    errors: true,
                    warnings: false,
                }
            },
            devMiddleware: {
                stats: 'errors-only',
            },
        },  // ← ВАЖНО: запятая после devServer!
        
        // Модули и правила обработки файлов
        module: {
            rules: [
                // Правило для JavaScript/React файлов
                {
                    test: /\.(js|jsx)$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                '@babel/preset-env',
                                '@babel/preset-react'
                            ]
                        }
                    }
                },
                // Правило для CSS и SCSS
                {
                    test: /\.(css|scss)$/,
                    use: [
                        isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
                        'css-loader',
                        {
                            loader: 'sass-loader',
                            options: {
                                api: 'modern',
                                sassOptions: {
                                    silenceDeprecations: ['legacy-js-api'],
                                },
                            },
                        },
                    ],
                },
                // Правило для изображений
                {
                    test: /\.(png|jpe?g|gif|svg)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'images/[hash][ext][query]'
                    }
                },
                // Правило для шрифтов
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/i,
                    type: 'asset/resource',
                    generator: {
                        filename: 'fonts/[hash][ext][query]'
                    }
                }
            ]
        },
        
        // Плагины
        plugins: [
            new HtmlWebpackPlugin({
                template: './src/index.html',
                minify: isProduction ? {
                    collapseWhitespace: true,
                    removeComments: true,
                } : false,
                title: 'Rose Story'
            }),
            ...(isProduction ? [
                new MiniCssExtractPlugin({
                    filename: 'css/[name].[contenthash].css'
                })
            ] : [])
        ],
        
        // Оптимизация сборки
        optimization: {
            minimize: isProduction,
            minimizer: [
                '...',
                ...(isProduction ? [new CssMinimizerPlugin()] : [])
            ],
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all'
                    }
                }
            }
        },
        
        // Настройка разрешения импортов
        resolve: {
            extensions: ['.js', '.jsx'],
            alias: {
                '@': path.resolve(__dirname, 'src'),
                '@styles': path.resolve(__dirname, 'src/styles')
            }
        },
        
        // Статистика - отключаем предупреждения
        stats: {
            all: false,
            warnings: false,
            errors: true,
            errorDetails: true,
        }
    };
};