# 2012 AMC 12B Problem 18

## Problem 18
Let ($a_1,a_2, \dots$ ,$a_{10}$) be a list of the first 10 positive integers such that for each 2 $\le$ i $\le 10$ either $a_i+1$ or $a_i-1$ or both appear somewhere before $a_i$ in the list. How many such lists are there?

$\textbf{(A)}\ 120\qquad\textbf{(B)}\ 512\qquad\textbf{(C)}\ 1024\qquad\textbf{(D)}\ 181,440\qquad\textbf{(E)}\ 362,880$
## Solution 1
Let $1\leqk\leq 10.$ Assume that $a_1$=k. If k<10, the first number appear after k that is greater than k must be $k+1$, otherwise if it is any number x larger than $k+1$, there will be neither $x-1$ nor $x+1$ appearing before x. Similarly, one can conclude that if k+$1<10$, the first number appear after $k+1$ that is larger than $k+1$ must be $k+2$, and so forth.

On the other hand, if k>1, the first number appear after k that is less than k must be $k-1$, and then $k-2$, and so forth.

To count the number of possibilities when $a_1$=k is given, we set up 9 spots after k, and assign $k-1$ of them to the numbers less than k and the rest to the numbers greater than k. The number of ways in doing so is 9 choose $k-1$.

Therefore, when summing up the cases from $k=1$ to 10, we get


$$\binom{9}{0} + \binom{9}{1} + \cdots + \binom{9}{9} = 2^9=512 ...... \framebox{B}$$

## Solution 2
This problem is worded awkwardly. More simply, it asks: “How many ways can you order numbers 1-10 so that each number is one above or below some previous term?”

Then, the method becomes clear. For some initial number, WLOG examine the numbers greater than it. They always must appear in ascending order later in the list, though not necessarily as adjacent terms. Then, for some initial number, the number of possible lists is just the number of combination where this number of terms can be placed in 9 slots. For 9, that’s 1 number in 9 potential slots. For 8, that’s 2 numbers in 9 potential slots.

$$\binom{9}{0} + \binom{9}{1} + \cdots + \binom{9}{9} =512 \implies \boxed{B}$$

~~BJHHar
## Solution 3 (Noticing Stuff)
If there is only 1 number, the number of ways to order would be 1.
If there are 2 numbers, the number of ways to order would be 2.
If there are 3 numbers, by listing out, the number of ways is 4.
We can then make a conjecture that the problem is simply powers of 2.
$$2^{10-1}=512.$$
## Solution 4 (fast and clever)
Assume that the first element is any integer.
Since we can only add the integer 1 more than the current max or 1 less the current min, there are 2 possibilities for each element after the first.
Once we have created a set of 10 elements, we can shift all of the elements by some constant so that they will be the first 10 positive integers.
Thus the total possibilities is $2^9.$

*~BlueDragon*
## Solution 5 (Recursion)
For a list {$a_1, a_2, \dots,a_k$} with k terms, 2 valid lists with $k+1$ terms can be created by 2 ways:

1. Add $a_{k+1}$ to the end of the list, making a new list {$a_1, a_2, \dots,a_k$, $a_{k+1}$ }

2. Increase the value of all existing terms by one, making a new list {$a_2, a_3, \dots,a_{k+1}$}. Then add $a_1$ to the end of the list, making a new list {$a_2, a_3, \dots,a_{k+1}$, $a_1$}

Let F(n) be the number of lists with n elements, $F(n) = 2\cdot F(n-1).$ As $F(2) = 2, F(n) = 2^{n-1}, F(10) =2^9 =\boxed{\textbf{(B) } 512}$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 6 (Recursion but explained better)
Let $(a_1,a_2\dotsa_k)$ be a valid list of $\{1,2 \dots k\}$. We wish to create a list of $\{1,2 \dots k+1\}$ using our valid list.

Claim: every k-list must end with either k or 1.

Proof: Let last element is 2 $\leq$ l $\leqk-1$. Two cases:

$l-1$ appears before l in the list: We apply the same to $l-1$ and get $l-2$ appearing before in the list and so on. This means that the set $\{1,2 \dots l-1\}$ has exactly $k-1$ elements. This gives ($l-1) -1 + 1 =k-1\implies$ l = k.

$l+1$ appears before l in the list: This tells us that $l+2$ appears before $l+1$, and $l+3$ before $l+2$ and so on. This means that the set $\{l+1, l+2 \dots l+j\}$ has exactly $k-1$ elements. This gives l+j - ($l+1) + 1 =k-1\impliesj =k-1\impliesl = 1$ (because l+j is an element, and that is only possible if $l=1$).

Now, we construct our list of $\{1,2 \dots k+1 \}$. First case is to just put $k+1$ at the end of $(a_1,a_2\dotsa_k)$ which gives us every valid list ending with $k+1$. Now, we need all valid lists ending with 1. Since our current list is of $\{1,2 \dots k\}$, if we add 1 to every element, our list becomes a list of $\{2,3 \dots k+1 \}$. But note that our list is still a valid list. So, if we add 1 to the end of this list, we will get every valid list of $k+1$ length ending with 1.

Thus, from a valid list of k, you get 2 valid lists of $k+1$. Let F(k) be lists of k. $F(k) = $2F(k-1), F(2) = 2 $\implies F(k) = 2^{k-1} \implies \boxed{F(10) = 2^9 = 512}$
## Video Solution by Richard Rusczyk
https://artofproblemsolving.com/videos/amc/2012amc12b/269

*~dolphin7*
## Video Solution by IceMatrix
https://youtu.be/bXPSv93GVbg
## See Also
