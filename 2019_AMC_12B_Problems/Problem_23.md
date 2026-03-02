# 2019 AMC 12B Problem 23

> This problem is the same as [2019 AMC 10B #25](https://artofproblemsolving.com/wiki/index.php/2019_AMC_10B_Problems#Problem_25) and [2019 AMC 12B #23](https://artofproblemsolving.com/wiki/index.php/2019_AMC_12B_Problems#Problem_23).
## Problem
How many sequences of $0s$ and $1s$ of length 19 are there that begin with a 0, end with a 0, contain no two consecutive $0s$, and contain no three consecutive $1s$?

$\textbf{(A) }55\qquad\textbf{(B) }60\qquad\textbf{(C) }65\qquad\textbf{(D) }70\qquad\textbf{(E) }75$
## Note
This problem is just a simplified version of [https://artofproblemsolving.com/wiki/index.php?title=2001_AIME_I_Problems/Problem_14&srsltid=AfmBOoqLszt_UmWFBs_xxaYfV_4kgkTGegMiIg7bR6BvL4N4_ndN3nZN 2001 AIME I, Problem 14], and a slightly harder version of [https://cms.math.ca/wp-content/uploads/2025/10/CLMC2025-Booklet.pdf CLMC 2025 C4].
## Solution 1 (Recursion)
Let f(n) be the number of valid sequences of length n (satisfying the conditions given in the problem).

We know our valid sequence must end in a 0. Then, since we cannot have two consecutive $0s$, it must end in a 10. Now, we only have two cases: it ends with 010, or it ends with 110 which is equivalent to 0110. Thus, our sequence must be of the forms $0\ldots010$ or $0\ldots0110.$ In the first case, the first $n-2$ digits are equivalent to a valid sequence of length $n-2$. In the second, the first $n-3$ digits are equivalent to a valid sequence of length $n-3$. Therefore, it must be the case that $f(n) = f(n-3) + f(n-2$), with n $\ge 3 (b$ecause otherwise, the sequence would contain only $0s$ and this is not allowed due to the given conditions).

It is easy to find f(3) = 1 since the only possible valid sequence is 010. f(4)=1 since the only possible valid sequence is 0110. f(5)=1 since the only possible valid sequence is 01010.

The recursive sequence is then as follows:


$$
f(3)=1
f(4)=1
f(5) = 1
f(6) = 1 + 1 = 2
f(7) = 1 + 1 = 2
f(8) = 1 + 2 = 3
f(9) = 2 + 2 = 4
f(10) = 2 + 3 = 5
f(11) = 3 + 4 = 7
f(12) = 4 + 5 = 9
f(13) = 5 + 7 = 12
f(14) = 7 + 9 = 16
f(15) = 9 + 12 = 21
f(16) = 12 + 16 = 28
f(17) = 16 + 21 = 37
f(18) = 21 + 28 = 49
f(19) = 28 + 37 = 65
$$


So, our answer is $\boxed{\text{\bf{(C)} } 65}.$

**Contributors:**

*~Original Author*

*~solasky*

*~BakedPotato66*

~[https://artofproblemsolving.com/wiki/index.php/User:Crazyvideogamez CrazyVideoGamez]
## Solution 2 (casework)
After any particular 0, the next 0 in the sequence must appear exactly 2 or 3 positions down the line. In this case, we start at position 1 and end at position 19, i.e. we move a total of 18 positions down the line. Therefore, we must add a series of $2s$ and $3s$ to get 18. There are a number of ways to do this:

**Case 1**: nine $2s$ - there is only 1 way to arrange them.

**Case 2**: two $3s$ and six $2s$ - there are {$8\choose2$} = 28 ways to arrange them.

**Case 3**: four $3s$ and three $2s$ - there are {$7\choose4$} = 35 ways to arrange them.

**Case 4**: six $3s$ - there is only 1 way to arrange them.

Summing the four cases gives $1+28+35+1=\boxed{\textbf{(C) }65}.$
## Solution 3 (casework and blocks)
We can simplify the original problem into a problem where there are $2^{17}$ binary characters with zeros at the beginning and the end. Then, we know that we cannot have a block of 2 zeroes and a block of 3 ones. Thus, our only options are a block of $0s$, $1s$, and $11s$. Now, we use casework:

**Case 1**: Alternating $1s$ and $0s$. There is simply 1 way to do this: 0101010101010101010.
Now, we note that there cannot be only one block of 11 in the entire sequence, as there must be zeroes at both ends and if we only include 1 block, of $11s$ this cannot be satisfied. This is true for all odd numbers of 11 blocks.

**Case 2**: There are 2 11 blocks. Using the zeroes in the sequence as dividers, we have a sample as 0110110101010101010. We know there are 8 places for $11s$, which will be filled by $1s$ if the $11s$ don't fill them. This is {$8\choose2$} = 28 ways.

**Case 3**: Four 11 blocks arranged. Using the same logic as Case 2, we have {$7\choose4$} = 35 ways to arrange four 11 blocks.

**Case 4**: No single 1 blocks, only 11 blocks. There is simply one case for this, which is 0110110110110110110.

Adding these four cases, we have $1+28+35+1=\boxed{\textbf{(C) }65}$ as our final answer.

*~Equinox8*
## Solution 4 (similar to #3)
Any valid sequence must start with a 0. We can then think of constructing a sequence as adding groups of terms to this 0, each ending in 0. (This is always possible because every valid string ends in 0.) For example, we can represent the string 01011010110110 as: 0-10-110-10-110-110.
To not have any consecutive $0s$, we must have at least one 1 before the next 0. However, we cannot have three or more $1s$ before the next 0 because we cannot have three consecutive $1s$. Consequently, we can only have one or two $1s$.

So we can have the groups: 10 and 110.

After the initial 0, we have 18 digits left to fill in the string. Let the number of 10 blocks be x, and 110 be y. Then x and y must satisfy $2x+3$y=18. We recognize this as a Diophantine equation. Taking $\pmod{2}$ yields $y=0\pmod{2}.$ Since x and y must both be nonnegative, we get the solutions (9, 0), (6, 2), (3, 4), and (0, 6). We now handle each of these cases separately.

(9, 0): Only one arrangement, namely all $10s$.

(6, 2): We have 6 groups of 11, and 2 groups of 110. This has $\binom{6+2}{2}=28$ cases.

(3, 4): This means we have 3 groups of 10, and 4 groups of 110. This has $\binom{3+4}{3}=35$ cases.

(0, 6): Only one arrangement, namely all 110.

Adding these, we have $1+28+35+1=65\longrightarrow \boxed{(C) 65}.$
*~Math4Life2020*

*~edited by alpha_2 for spelling and and typos*
## Solution 5 (Constructive Counting)
Suppose the number of $0s$ is n. We can construct the sequence in two steps:

Step 1: put $n-1$ of $1s$ between the $0s$;

Step 2: put the rest 19-n-($n-1)=20-2n$ of $1s$ in the $n-1$ spots where there is a 1. There are $\binom{n-1}{20-2n}$ ways of doing this.

Therefore the answer is

$$\sum_n \binom{n-1}{20-2n} = \binom{6}{6} + \binom{7}{4} + \binom{8}{2} + \binom{9}{0} = \boxed{\textbf{(C) }65}.$$


*~asops*
## Solution 6 (Recursion)
For a valid sequence of length n, the sequence must be in the form of 01xx...xx10. By removing the 01 at the start of the sequence and the 10 at the end of the sequence, there are $n-4$ bits left. The $n-4$ bits left can be in the form of:
 0yy...yy0, the whole $(n-4)$ bits are valid sequence, which is f$(n-4)$
 0yy...y01, the $(n-5)$ bits before the last 1 are valid sequence, which is f$(n-5)$
 $10y$...yy0, the $(n-5)$ bits after the first 1 are valid sequence, which is f$(n-5)$
 $10y$...y01, the $(n-6)$ bits between the first and last 1 are valid sequence, which is f$(n-6)$

$$So, f(n) = f(n-4) + 2f(n-5) + f(n-6)$$

We will calculate f(19) by [https://en.wikipedia.org/wiki/Dynamic_programming Dynamic Programming].

$$f(3) = 1$$

$$f(4) = 1$$

$$f(5) = 1$$

$$f(6) = 2$$

$$f(7) = 2$$

$$f(8) = 3$$

$$f(9) = f(5) + 2 \cdot f(4) + f(3) = 1 + 2 \cdot 1 + 1 = 4$$

$$f(10) = f(6) + 2 \cdot f(5) + f(4) = 2 + 2 \cdot 1 + 1 = 5$$

$$f(11) = f(7) + 2 \cdot f(6) + f(5) = 2 + 2 \cdot 1 + 1 = 7$$

$$f(12) = f(8) + 2 \cdot f(7) + f(6) = 3 + 2 \cdot 2 + 2 = 9$$

$$f(13) = f(9) + 2 \cdot f(8) + f(7) = 4 + 2 \cdot 3 + 2 = 12$$

$$f(14) = f(10) + 2 \cdot f(9) + f(8) = 5 + 2 \cdot 4 + 3 = 16$$

$$f(15) = f(11) + 2 \cdot f(10) + f(9) = 7 + 2 \cdot 5 + 4 = 21$$

$$f(16) = f(12) + 2 \cdot f(11) + f(10) = 9 + 2 \cdot 7 + 5 = 28$$

$$f(17) = f(13) + 2 \cdot f(12) + f(11) = 12 + 2 \cdot 9 + 7 = 37$$

$$f(18) = f(14) + 2 \cdot f(13) + f(12) = 16 + 2 \cdot 12 + 9 = 49$$


$$f(19) = f(15) + 2 \cdot f(14) + f(13) = 21 + 2 \cdot 16 + 12 = \boxed{\text{\bf{(C)} } 65}$$


We can further prove $f(n) = f(n-4) + 2f(n-5) + f(n-6)$ is equivalent to $f(n) = f(n-2) + f(n-3$)

Let $k(n) = f(n-2) + f(n-3$)

$$k(n-2) = f(n-4) + f(n-5)$$

$$k(n-3) = f(n-5) + f(n-6)$$

$$k(n-2)+ k(n-3) = f(n-4) + 2f(n-5) + f(n-6) = f(n)$$

$$f(n) = k(n-2)+ k(n-3)$$

$$f(n-2) = k(n-4)+ k(n-5)$$

$$f(n-3) = k(n-5)+ k(n-6)$$


$$k(n) = f(n-2) + f(n-3) = k(n-4)+ k(n-5) + k(n-5)+ k(n-6) = k(n-4) + 2k(n-5) + k(n-6)$$


So k(n) is the same as f(n).

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 7 (Quick Solution by Estimating)
Using the tree diagram, you quickly notice that your answer must be very close to a power of 2 due to the splitting of the tree branches in a tree diagram. 2^6 is 64, which is very close to 65, thus giving our answer of $\boxed{\textbf{(C) }65}.$

*~MichaeLLin16 ~Minor Edit and Moving by [https://artofproblemsolving.com/wiki/index.php/User:HappySharks HappySharks]*
## Solution 8 (Sequence Dividing and Path Counting)
You can split the sequence into 0 and 6 strings of three numbers, which can only be 010,011,110,101, labelled as A,B,C,D respectively. For example, 0101....010 is labelled 0DADADA. This can also be stated as 0, $D_{1}$, $A_{2}$, $D_{3}$, etc. The problem is equivalent to find the number of such sequences. For each string, A can be followed by C and D, B can be followed by A and B, C can be followed by C and D, D can be followed by A,B, and D.  If we define n$(A_{i})$ as number of possible sequences that ends with string A at the ith spot (thus be $3i+1$ numbers long), we may find relationship between these numbers by noting that, for the $i+1$ th string, with i $\geq 1$

$$
n(A_{i+1}) = n(B_{i+1}) = n(B_{i}) + n(D_{i}), n(C_{i+1}) = n(A_{i}) + n(C_{i})
n(D_{i+1}) = n(A_{i}) + n(C_{i}) + n(D_{i}).
$$

Since the first number of the sequence must be zero, we must start with n$(A_1) = n(B_1) = $0, n(C_1)$ = n(D_1) = 1$. Using the above steps to evolve the situation from $i = 1 to i = 6$, we get n$(A_{6}) = 37, n(B_{6}) = $37, n(C_{6}) = $28, n(D_{6}) = 49$.
Since the sequence ends with 0, we only need to sum n$(A_{6})$ and n$(C_{6})$, which yields $37+28=$65.  $\boxed{\textbf{(C) }65}$

Solution by ~Cc2010cc2015

minor edit by ~CLA
## Solution 9
We define a sequences of 01 (a) or 011 (b). Observe that we can put the the a's and b's in any way and we meet all the different requirements. Note that this can be found through just playing around with the problem's mechanics. Now we can see a big problem. With sequences of a and b, the main sequence always end with a 1. '

Now a simple fix is just to add zero to the end of the sequence, shortening it effectively to 18 undecided digits. Now we have multiple cases.


$$
\begin{align*}
18 &= 9a + 0b &\rightarrow \dfrac{(9+0)!}{9!} \\
&= 6a + 2b &\rightarrow \dfrac{(6+2)!}{6!}\\
&= 3a + 4b &\rightarrow \dfrac{(3 + 4)!}{4!}\\
&= 0a + 6b &\rightarrow \dfrac{(0+6)!}{6!}\\
\end{align*}
$$


(Here's how I was able to see this, I put a zero, than I have to put a one, and then I can put a one or a zero. Then I saw that after every zero, a certain pattern repeats.)

- Created by wiselion :)
## Solution 10 (Recursion)
Lets use recursion to solve this problem. First, lets try out making this problem smaller by replace 19 with 1,2, and 3. Let $a_n$ be the number of ways to create strings of 0's and 1's that follow the restrictions. So, $a_1=1$ because the only possibility is just 0. We also have $a_2=0$ since it must start with 0 and end with 0 but there can not be two consecutive 0's. Lastly, $a_3=1$ (just 010). Now, we can find the recurrence equation. Lets start with a string of length n. We know it must go something like 0 \_\_\_$\ldots$\_\_\_ 0. We can start filling in some of this. It could go like 0 1 0 \_$\ldots$\_\_\_ 0 or 0 1 1 \_$\ldots$\_\_\_ 0. Now, lets examine these closely. In the first case, this is basically just $a_{n-2}$ because the length of the string is now only $n-2$. Similarly with the second case, it is just $a_{n-3}$. So, we can write the equation $a_n=a_{n-2}+a_{n-3}$. Now, we simply continuously plug in small values of n, and keep increasing them to get to 19. So, we keep continuously plugging in values of n to get new values of n to give us an answer of $a_{19}=\boxed{\text{\bf{(C)} } 65}.$

*~jb2015007*
## Video Solution by OmegaLearn
https://youtu.be/WpSpnx8PPnc?t=94

*~pi_is_3.14*
## Video Solution 1
https://youtu.be/VamT49PjmdI
## Video Solution 2
https://www.youtube.com/watch?v=eMWV87zmPFs&

*~avibatra*
## See Also
