# 2020 AMC 12A Problem 8

> This problem is the same as [2020 AMC 12A #8](https://artofproblemsolving.com/wiki/index.php/2020_AMC_12A_Problems) and [2020 AMC 10A #11](https://artofproblemsolving.com/wiki/index.php/2020_AMC_10A_Problems).
## Problem
What is the median of the following list of $4040$ numbers$?$


$$1, 2, 3, \ldots, 2020, 1^2, 2^2, 3^2, \ldots, 2020^2$$


$\textbf{(A)}\ 1974.5\qquad\textbf{(B)}\ 1975.5\qquad\textbf{(C)}\ 1976.5\qquad\textbf{(D)}\ 1977.5\qquad\textbf{(E)}\ 1978.5$
## Solution 1
We can see that $44^2=1936$ which is less than 2020. Therefore, there are $2020-44=1976$ of the $4040$ numbers greater than $2020$. Also, there are $2020+44=2064$ numbers that are less than or equal to $2020$.

Since there are $44$ duplicates/extras, it will shift up our median's placement down $44$. Had the list of numbers been $1,2,3, \dots, 4040$, the median of the whole set would be $\dfrac{1+4040}{2}=2020.5$.

Thus, our answer is $\boxed{\textbf{(C)}\ 1976.5}$.

*~aryam*

*~Additions by BakedPotato66*
## Solution 2
As we are trying to find the median of a $4040$-term set, we must find the average of the $2020$th and $2021$st terms.

Since $45^2 = 2025$ is slightly greater than $2020$, we know that the $44$ perfect squares $1^2$ through $44^2$ are less than $2020$, and the rest are greater. Thus, from the number $1$ to the number $2020$, there are $2020 + 44 = 2064$ terms. Since $44^2$ is $44 + 45 = 89$ less than $45^2 = 2025$ and $84$ less than $2020$, we will only need to consider the perfect square terms going down from the $2064$th term, $2020$, after going down $84$ terms. Since the $2020$th and $2021$st terms are only $44$ and $43$ terms away from the $2064$th term, we can simply subtract $44$ from $2020$ and $43$ from $2020$ to get the two terms, which are $1976$ and $1977$. Averaging the two, we get $\boxed{\textbf{(C)}\ 1976.5}.$

*~emerald_block*
## Solution 3
We want to know the $2020$th term and the $2021$st term to get the median.

We know that $44^2=1936$. So, numbers $1^2, 2^2, \ldots,44^2$ are in between $1$ and $1936$.

So, the sum of $44$ and $1936$ will result in $1980$, which means that $1936$ is the $1980$th number.

Also, notice that $45^2=2025$, which is larger than $2021$.

Then the $2020$th term will be $1936+40 = 1976$, and similarly the $2021$th term will be $1977$.

Solving for the median of the two numbers, we get $\boxed{\textbf{(C)}\ 1976.5}$

*~toastybaker*
## Solution 4
We note that $44^2 = 1936$, which is the largest square less than $2020$, which means that there are $44$ additional terms before $2020$. This makes $2020$ the $2064$th term. To find the median, we need the $2020$th and $2021$st term. We note that every term before $2020$ is one less than the previous term (That is, we subtract $1$ to get the previous term.). If $2020$ is the $2064$th term, than $2020 - 44$ is the $(2064 - 44)$th term. So, the $2020$th term is $1976$, and the $2021$st term is $1977$, and the average of these two terms is the median, or $\boxed{\textbf{(C)}\ 1976.5}$.

*~primegn*
## Solution 5 (Decreasing Order)
To find the median, we sort the $4040$ numbers in decreasing order, then average the $2020$th and the $2021$st numbers of the sorted list.

Since $45^2=2025$ and $44^2=1936,$ the first $2021$ numbers of the sorted list are

$$\underbrace{2020^2,2019^2,2018^2,\ldots,46^2,45^2}_{1976\mathrm{ \ numbers}}\phantom{ },\phantom{ }\underbrace{2020,2019,2018,\ldots,1977,1976}_{45\mathrm{ \ numbers}}\phantom{ },$$

 from which the answer is $\frac{1977+1976}{2}=\boxed{\textbf{(C)}\ 1976.5}.$

*~MRENTHUSIASM*
## Video Solution by Education, The Study of Everything
https://youtu.be/luMQHhp_Rfk
## Video Solution by TheBeautyOfMath
https://youtu.be/ZGwAasE32Y4

*~IceMatrix*
## Video Solution by WhyMath
https://youtu.be/B0RPkcjdkPU

*~savannahsolver*
## Video Solution by OmegaLearn
https://youtu.be/xqo0PgH-h8Y?t=363

*~pi_is_3.14*
## See Also
