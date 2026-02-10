import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { HealthResolver } from '@infrastructure/graphql/health.resolver';
import { join } from 'path';
import { LoadersModule } from './loaders/loaders.module';
import { LoadersFactory } from '@infrastructure/graphql/loaders/loaders.factory';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [LoadersModule],
      inject: [LoadersFactory],
      useFactory: (loadersFactory: LoadersFactory) => ({
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        playground: process.env.NODE_ENV !== 'production',
        includeStacktraceInErrorResponses:
          process.env.NODE_ENV !== 'production',
        sortSchema: true,
        context: () => ({
          loaders: loadersFactory.create(),
        }),
      }),
    }),
    LoadersModule,
  ],
  providers: [HealthResolver],
})
export class GraphqlModule {}
