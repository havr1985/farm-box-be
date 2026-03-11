import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { HealthResolver } from '@infrastructure/graphql/health.resolver';
import { join } from 'path';
import { LoadersModule } from './loaders/loaders.module';
import { LoadersFactory } from '@infrastructure/graphql/loaders/loaders.factory';
import { AppException } from '@common/exceptions/app.exception';
import { GraphQLError } from 'graphql';
import { Request } from 'express';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [LoadersModule],
      inject: [LoadersFactory],
      useFactory: (loadersFactory: LoadersFactory) => ({
        autoSchemaFile: true,
        graphiql: process.env.NODE_ENV !== 'production',
        includeStacktraceInErrorResponses:
          process.env.NODE_ENV !== 'production',
        sortSchema: true,
        context: ({ req }: { req: Request }) => ({
          req,
          loaders: loadersFactory.create(),
        }),
        formatError: (formattedError: GraphQLError, error) => {
          const originalError = (error as { originalError?: Error })
            ?.originalError;
          if (originalError && originalError instanceof AppException) {
            return {
              message: originalError.detail || originalError.title,
              extensions: {
                code: originalError.type,
                title: originalError.title,
                status: originalError.getStatus(),
                errors: originalError.errors,
                ...(process.env.NODE_ENV !== 'production' && {
                  stacktrace: originalError.stack?.split('\n'),
                }),
              },
            };
          }
          if (process.env.NODE_ENV === 'production') {
            return {
              message: formattedError.message,
              extensions: {
                code:
                  formattedError.extensions?.code || 'INTERNAL_SERVER_ERROR',
              },
            };
          }
          return formattedError;
        },
      }),
    }),
    LoadersModule,
  ],
  providers: [HealthResolver],
})
export class GraphqlModule {}
