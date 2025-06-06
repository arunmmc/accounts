from django.shortcuts import render

# Create your views here.
# bank_accounts/views.py
from rest_framework import viewsets, status,generics
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User
from .models import BankAccount, Transaction, LedgerEntry, CashbookEntry, Payment, Budget, AdministrativeOrder
from .serializers import (
    BankAccountSerializer, TransactionSerializer, LedgerEntrySerializer,
    CashbookEntrySerializer, PaymentSerializer, BudgetSerializer,
    AdministrativeOrderSerializer, UserSerializer # Import the new UserSerializer
)
from django.db.models import Sum
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend




class BankAccountViewSet(viewsets.ModelViewSet):
    # Add the queryset attribute here
    queryset = BankAccount.objects.all() # Define the base queryset for the viewset
    serializer_class = BankAccountSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = []
    search_fields = ['account_name', 'account_number', 'bank_name', 'name']
    ordering_fields = ['balance', 'created_at']

    def get_queryset(self):
        # This method can still apply further filtering if needed,
        # but the viewset now has a default queryset.
        # Since you want all users to see all accounts, this can simply return self.queryset
        # or if you previously had a filter here for user-specific data, you'd remove it for global view.
        return self.queryset.all().order_by('-created_at') # Or simply return self.queryset if no further filtering


class TransactionViewSet(viewsets.ModelViewSet):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]

    # Adjust filter fields to use 'account' instead of 'bank_account'
    filterset_fields = ['transaction_type', 'account']

    # Adjust search fields to use 'account__name' and 'account__account_number'
    search_fields = ['description', 'account__name', 'account__account_number']
    ordering_fields = ['amount', 'date', 'created_at']

   

    @action(detail=False, methods=['get'])
    def bank_statement(self, request):
        """Generates a simple bank statement for a given account and date range."""
        account_id = request.query_params.get('account_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not all([account_id, start_date, end_date]):
            return Response({"error": "account_id, start_date, and end_date are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            account = BankAccount.objects.get(id=account_id)
            transactions = Transaction.objects.filter(
                account=account,
                transaction_date__range=[start_date, end_date]
            ).order_by('transaction_date')
            serializer = self.get_serializer(transactions, many=True)
            return Response({
                "account": BankAccountSerializer(account).data,
                "transactions": serializer.data
            })
        except BankAccount.DoesNotExist:
            return Response({"error": "Bank account not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LedgerEntryViewSet(viewsets.ModelViewSet):
    queryset = LedgerEntry.objects.all()
    serializer_class = LedgerEntrySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class CashbookEntryViewSet(viewsets.ModelViewSet):
    queryset = CashbookEntry.objects.all()
    serializer_class = CashbookEntrySerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # When creating a payment, ensure a corresponding transaction is created first
        # This is a simplified example; in a real app, you'd handle this more robustly
        # e.g., by creating the transaction within the serializer's create method.
        transaction_data = self.request.data.get('transaction', {})
        if not transaction_data:
            raise serializers.ValidationError({"transaction": "Transaction details are required."})

        # Ensure transaction_type is 'DEBIT' for payments
        transaction_data['transaction_type'] = 'DEBIT'
        transaction_data['created_by'] = self.request.user.id # Pass user ID

        transaction_serializer = TransactionSerializer(data=transaction_data)
        transaction_serializer.is_valid(raise_exception=True)
        transaction = transaction_serializer.save(created_by=self.request.user) # Save with user

        serializer.save(transaction=transaction)

class BudgetViewSet(viewsets.ModelViewSet):
    queryset = Budget.objects.all()
    serializer_class = BudgetSerializer
    permission_classes = [IsAuthenticated]

class AdministrativeOrderViewSet(viewsets.ModelViewSet):
    queryset = AdministrativeOrder.objects.all()
    serializer_class = AdministrativeOrderSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # If a related_transaction_id is provided, link it.
        # Otherwise, the order might be created before the transaction.
        serializer.save()


# --- New User Registration View ---
class UserRegistrationView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny] # Allow unauthenticated users to register
# --- End New User Registration View ---
