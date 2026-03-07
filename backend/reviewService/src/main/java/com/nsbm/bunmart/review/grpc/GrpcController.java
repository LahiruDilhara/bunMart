package com.nsbm.bunmart.review.grpc;

import com.nsbm.bunmart.review.dto.PaginatedReviewsDTO;
import com.nsbm.bunmart.review.dto.ProductRatingDTO;
import com.nsbm.bunmart.review.mappers.grpc.GRPCMapper;
import com.nsbm.bunmart.review.services.ReviewService;
import com.nsbm.bunmart.review.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class GrpcController extends ReviewServiceGrpc.ReviewServiceImplBase {

    private final ReviewService reviewService;
    private final GRPCMapper grpcMapper;

    @Override
    public void getReviews(GetReviewsRequest request, StreamObserver<GetReviewsResponse> responseObserver) {
        int pageSize = request.getPageSize() > 0 ? request.getPageSize() : 20;
        String pageToken = request.getPageToken();
        PaginatedReviewsDTO result = reviewService.getByProductIdPaginated(
                request.getProductId(), pageSize, pageToken != null && !pageToken.isEmpty() ? pageToken : "0");
        GetReviewsResponse response = grpcMapper.toGetReviewsResponse(result);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void getProductRating(GetProductRatingRequest request, StreamObserver<GetProductRatingResponse> responseObserver) {
        ProductRatingDTO rating = reviewService.getProductRating(request.getProductId());
        GetProductRatingResponse response = grpcMapper.toGetProductRatingResponse(rating);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
