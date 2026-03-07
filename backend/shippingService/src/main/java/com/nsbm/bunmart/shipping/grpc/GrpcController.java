package com.nsbm.bunmart.shipping.grpc;

import com.nsbm.bunmart.shipping.dto.CreateShippingPackageRequestDTO;
import com.nsbm.bunmart.shipping.mappers.grpc.GRPCMapper;
import com.nsbm.bunmart.shipping.model.ShippingPackage;
import com.nsbm.bunmart.shipping.services.ShippingPackageService;
import com.nsbm.bunmart.shipping.v1.*;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class GrpcController extends ShippingServiceGrpc.ShippingServiceImplBase {

    private final ShippingPackageService shippingPackageService;
    private final GRPCMapper grpcMapper;

    @Override
    public void createShippingPackage(CreateShippingPackageRequest request, StreamObserver<CreateShippingPackageResponse> responseObserver) {
        CreateShippingPackageRequestDTO dto = grpcMapper.toCreateShippingPackageRequestDTO(request);
        ShippingPackage pkg = shippingPackageService.createShippingPackage(dto);
        CreateShippingPackageResponse response = grpcMapper.toCreateShippingPackageResponse(pkg);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    @Transactional(readOnly = true)
    public void getShippingPackage(GetShippingPackageRequest request, StreamObserver<GetShippingPackageResponse> responseObserver) {
        ShippingPackage pkg = shippingPackageService.getShippingPackage(request.getShippingPackageId());
        GetShippingPackageResponse response = grpcMapper.toGetShippingPackageResponse(pkg);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void updateShippingPackageStatus(UpdateShippingPackageStatusRequest request, StreamObserver<UpdateShippingPackageStatusResponse> responseObserver) {
        String status = request.getStatus() != null && !request.getStatus().isBlank() ? request.getStatus() : null;
        Integer progress = request.getProgress() >= 0 ? request.getProgress() : null;
        shippingPackageService.updateStatusAndProgress(request.getShippingPackageId(), status, progress);
        UpdateShippingPackageStatusResponse response = grpcMapper.toUpdateShippingPackageStatusResponse(true);
        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
