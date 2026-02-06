package com.nsbm.bunmart.mock.grpc;

import com.google.protobuf.Timestamp;
import com.nsbm.bunmart.review.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

import java.time.Instant;

@Slf4j
@GrpcService
public class ReviewGrpcController extends ReviewServiceGrpc.ReviewServiceImplBase {

    private static Timestamp now() {
        return Timestamp.newBuilder().setSeconds(Instant.now().getEpochSecond()).build();
    }

    @Override
    public void getReviews(GetReviewsRequest request, StreamObserver<GetReviewsResponse> responseObserver) {
        ReviewInfo review = ReviewInfo.newBuilder()
                .setReviewId("rev-mock-1")
                .setProductId(request.getProductId())
                .setUserId("user-mock")
                .setRating(5)
                .setComment("Mock review comment")
                .setStatus("APPROVED")
                .setCreatedAt(now())
                .build();
        responseObserver.onNext(GetReviewsResponse.newBuilder()
                .addReviews(review)
                .build());
        responseObserver.onCompleted();
        log.debug("getReviews: productId={}, pageSize={}", request.getProductId(), request.getPageSize());
    }

    @Override
    public void getProductRating(GetProductRatingRequest request, StreamObserver<GetProductRatingResponse> responseObserver) {
        responseObserver.onNext(GetProductRatingResponse.newBuilder()
                .setProductId(request.getProductId())
                .setAverageRating(4.5)
                .setTotalCount(10)
                .build());
        responseObserver.onCompleted();
        log.debug("getProductRating: productId={}", request.getProductId());
    }
}
